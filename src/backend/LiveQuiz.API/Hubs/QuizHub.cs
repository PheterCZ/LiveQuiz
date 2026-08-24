using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;
using Microsoft.AspNetCore.SignalR;

namespace LiveQuiz.API.Hubs
{
    public class QuizHub : Hub
    {
        private readonly IQuizService _quizService;
        private readonly IQuestionService _questionService;
        private readonly IAnswerService _answerService;
        private readonly IQuizSessionService _quizSessionService;

        public QuizHub(
            IQuizService quizService,
            IQuestionService questionService,
            IAnswerService answerService,
            IQuizSessionService quizSessionService)
        {
            _quizService = quizService;
            _questionService = questionService;
            _answerService = answerService;
            _quizSessionService = quizSessionService;
        }

        public async Task JoinQuiz(Guid quizId, string playerName)
        {
            var quiz = await _quizService.GetQuizAsync(quizId);
            if (quiz is null)
                throw new HubException("Quiz not found.");

            ValidatePlayerName(playerName);
            playerName = playerName.Trim();

            var player = new PlayerScore(playerName, Context.ConnectionId);
            if (!_quizSessionService.AddPlayer(quizId, player))
                throw new HubException("This player name is already taken.");

            await Groups.AddToGroupAsync(Context.ConnectionId, quizId.ToString());
            await Clients.Group(quizId.ToString()).SendAsync("UserJoined", Context.ConnectionId, playerName);
        }

        public async Task JoinHost(Guid quizId, string hostToken)
        {
            var quiz = await _quizService.GetQuizAsync(quizId);
            if (quiz is null)
                throw new HubException("Quiz not found.");

            if (!await _quizService.ValidateHostTokenAsync(quizId, hostToken))
                throw new HubException("Invalid host token.");

            await Groups.AddToGroupAsync(Context.ConnectionId, quizId.ToString());
            Console.WriteLine($"Host joined quiz: {quizId}");
        }

        public async Task StartQuiz(Guid quizId, string hostToken)
        {
            var quiz = await _quizService.GetQuizAsync(quizId);
            if (quiz is null)
                throw new HubException("Quiz not found.");

            if (!await _quizService.ValidateHostTokenAsync(quizId, hostToken))
                throw new HubException("Only the host can start the quiz.");

            if (quiz.IsStarted)
                return;

            var firstOrder = await _questionService.GetFirstQuestionOrderAsync(quizId);
            if (!firstOrder.HasValue)
                throw new HubException("Quiz has no questions.");

            if (!await _quizService.StartQuizAsync(quizId, hostToken))
                throw new HubException("Quiz could not be started.");

            _quizSessionService.ResetPlayers(quizId, firstOrder.Value);
            await Clients.Group(quizId.ToString()).SendAsync("QuizStarted", firstOrder.Value);
        }

        public async Task NextQuestion(Guid quizId, int questionOrder)
        {
            var quiz = await _quizService.GetQuizAsync(quizId);
            if (quiz is null)
                throw new HubException("Quiz not found.");

            await Clients.Group(quizId.ToString()).SendAsync("QuestionChanged", questionOrder);
        }

        public async Task SubmitAnswer(Guid quizId, Guid questionId, Guid answerId)
        {
            var quiz = await _quizService.GetQuizAsync(quizId);
            if (quiz is null)
                throw new HubException("Quiz not found.");

            var answer = await ValidateAnswer(questionId, answerId);
            var player = _quizSessionService.GetPlayer(quizId, Context.ConnectionId);
            if (player is null)
                throw new HubException("Player is not connected to this quiz.");

            var questions = await _questionService.GetAllQuestionsAsync(quizId);
            var currentQuestion = questions.FirstOrDefault(q => q.Id == questionId);
            if (currentQuestion is null)
                throw new HubException("Question not found.");

            if (player.CurrentQuestionOrder != currentQuestion.Order)
                throw new HubException("This is not your current question.");

            var result = _quizSessionService.HandleAnswerSubmission(
                quizId, questionId, answer.IsCorrect, Context.ConnectionId, questions);

            await Clients.Caller.SendAsync("AnswerSubmitted", answerId, answer.IsCorrect, result!.PlayerScore);

            if (result.NextQuestionOrder.HasValue)
            {
                await Clients.Caller.SendAsync("QuestionChanged", result.NextQuestionOrder.Value);
            }
            else
            {
                await TryFinishQuiz(quizId);
            }
        }

        private async Task TryFinishQuiz(Guid quizId)
        {
            var players = _quizSessionService.GetPlayers(quizId);
            if (players.Count == 0 || !players.All(p => p.IsFinished))
                return;

            var leaderboard = players
                .OrderByDescending(p => p.Score)
                .ThenBy(p => p.Name)
                .Select((p, i) => new LeaderboardEntryDto(i + 1, p.Name, p.Score))
                .ToList();

            await Clients.Group(quizId.ToString()).SendAsync("QuizFinished", leaderboard);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _quizSessionService.RemovePlayer(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }


        private void ValidatePlayerName(string playerName)
        {
            if (string.IsNullOrWhiteSpace(playerName))
                throw new HubException("Player name is required.");
            if (playerName.Trim().Length > 20)
                throw new HubException("Player name is too long.");
        }

        private async Task<AnswerDto> ValidateAnswer(Guid questionId, Guid answerId)
        {
            var answers = await _answerService.GetAnswersByQuestionIdAsync(questionId);
            var answer = answers.FirstOrDefault(a => a.Id == answerId);
            if (answer is null)
                throw new HubException("Answer not found.");
            return answer;
        }
    }
}