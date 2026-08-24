using System.Collections.Concurrent;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Application.Services;
using Microsoft.AspNetCore.SignalR;


namespace LiveQuiz.API.Hubs
{
    public class QuizHub : Hub
    {
        private readonly IQuizService _quizService;
        private readonly IQuestionService _questionService;
        private readonly IAnswerService _answerService;

        private static readonly ConcurrentDictionary<
            Guid,
            ConcurrentDictionary<string, PlayerScore>
        > Scores = new();

        public QuizHub(
            IQuizService quizService,
            IQuestionService questionService,
            IAnswerService answerService)
        {
            _quizService = quizService;
            _questionService = questionService;
            _answerService = answerService;
        }

        public async Task JoinQuiz(
            Guid quizId,
            string playerName)
        {
            var quiz =
                await _quizService.GetQuizAsync(quizId);

            if (quiz is null)
            {
                throw new HubException(
                    "Quiz not found."
                );
            }

            if (string.IsNullOrWhiteSpace(playerName))
            {
                throw new HubException(
                    "Player name is required."
                );
            }

            playerName = playerName.Trim();

            if (playerName.Length > 20)
            {
                throw new HubException(
                    "Player name is too long."
                );
            }

            var quizScores =
                Scores.GetOrAdd(
                    quizId,
                    _ => new ConcurrentDictionary<string, PlayerScore>()
                );

            if (quizScores.ContainsKey(playerName))
            {
                throw new HubException(
                    "This player name is already taken."
                );
            }

            quizScores[playerName] =
                new PlayerScore(
                    playerName,
                    Context.ConnectionId
                );

            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                quizId.ToString()
            );

            await Clients.Group(
                quizId.ToString()
            ).SendAsync(
                "UserJoined",
                Context.ConnectionId,
                playerName
            );
        }

        public async Task JoinHost(
            Guid quizId,
            string hostToken)
        {
            var quiz =
                await _quizService.GetQuizAsync(quizId);

            if (quiz is null)
            {
                throw new HubException(
                    "Quiz not found."
                );
            }

            var isHost =
                await _quizService.ValidateHostTokenAsync(
                    quizId,
                    hostToken
                );

            if (!isHost)
            {
                throw new HubException(
                    "Invalid host token."
                );
            }

            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                quizId.ToString()
            );

            Console.WriteLine(
                $"Host joined quiz: {quizId}"
            );
        }

        public async Task StartQuiz(
            Guid quizId,
            string hostToken)
        {
            var quiz =
                await _quizService.GetQuizAsync(quizId);

            if (quiz is null)
            {
                throw new HubException(
                    "Quiz not found."
                );
            }

            var isHost =
                await _quizService.ValidateHostTokenAsync(
                    quizId,
                    hostToken
                );

            if (!isHost)
            {
                throw new HubException(
                    "Only the host can start the quiz."
                );
            }

            if (quiz.IsStarted)
            {
                return;
            }

            var questions =
                await _questionService
                    .GetAllQuestionsAsync(quizId);

            var firstOrder = questions
                .OrderBy(q => q.Order)
                .Select(q => q.Order)
                .FirstOrDefault();

            if (firstOrder == 0)
            {
                throw new HubException(
                    "Quiz has no questions."
                );
            }

            var started =
                await _quizService.StartQuizAsync(
                    quizId,
                    hostToken
                );

            if (!started)
            {
                throw new HubException(
                    "Quiz could not be started."
                );
            }

            ResetQuizScores(
                quizId,
                firstOrder
            );

            await Clients.Group(
                quizId.ToString()
            ).SendAsync(
                "QuizStarted",
                firstOrder
            );
        }

        public async Task NextQuestion(
            Guid quizId,
            int questionOrder)
        {
            var quiz =
                await _quizService.GetQuizAsync(quizId);

            if (quiz is null)
            {
                throw new HubException(
                    "Quiz not found."
                );
            }

            await Clients.Group(
                quizId.ToString()
            ).SendAsync(
                "QuestionChanged",
                questionOrder
            );
        }

        public async Task SubmitAnswer(
            Guid quizId,
            Guid questionId,
            Guid answerId)
        {
            var quiz =
                await _quizService.GetQuizAsync(quizId);

            if (quiz is null)
            {
                throw new HubException(
                    "Quiz not found."
                );
            }

            var answers =
                await _answerService
                    .GetAnswersByQuestionIdAsync(
                        questionId
                    );

            var answer =
                answers.FirstOrDefault(
                    a => a.Id == answerId
                );

            if (answer is null)
            {
                throw new HubException(
                    "Answer not found."
                );
            }

            var quizScores =
                Scores.GetValueOrDefault(quizId);

            if (quizScores is null)
            {
                throw new HubException(
                    "No players are connected to this quiz."
                );
            }

            var player =
                quizScores.Values.FirstOrDefault(
                    player =>
                        player.ConnectionId ==
                        Context.ConnectionId
                );

            if (player is null)
            {
                throw new HubException(
                    "Player is not connected to this quiz."
                );
            }

            var questions =
                await _questionService
                    .GetAllQuestionsAsync(quizId);

            var currentQuestion =
                questions.FirstOrDefault(
                    question =>
                        question.Id == questionId
                );

            if (currentQuestion is null)
            {
                throw new HubException(
                    "Question not found."
                );
            }

            if (
                player.CurrentQuestionOrder !=
                currentQuestion.Order
            )
            {
                throw new HubException(
                    "This is not your current question."
                );
            }

            var alreadyAnswered =
                player.AnsweredQuestions.Contains(
                    questionId
                );

            if (!alreadyAnswered)
            {
                player.AnsweredQuestions.Add(
                    questionId
                );

                if (answer.IsCorrect)
                {
                    player.Score++;
                }
            }

            await Clients.Caller.SendAsync(
                "AnswerSubmitted",
                answerId,
                answer.IsCorrect,
                player.Score
            );

            var nextQuestionOrder =
                questions
                    .Where(
                        question =>
                            question.Order >
                            currentQuestion.Order
                    )
                    .OrderBy(
                        question =>
                            question.Order
                    )
                    .Select(
                        question =>
                            question.Order
                    )
                    .FirstOrDefault();

            if (nextQuestionOrder == 0)
            {
                player.IsFinished = true;

                await TryFinishQuiz(
                    quizId
                );

                return;
            }

            player.CurrentQuestionOrder =
                nextQuestionOrder;

            await Clients.Caller.SendAsync(
                "QuestionChanged",
                nextQuestionOrder
            );
        }

        private async Task TryFinishQuiz(
            Guid quizId)
        {
            if (!Scores.TryGetValue(
                    quizId,
                    out var quizScores))
            {
                return;
            }

            if (quizScores.IsEmpty)
            {
                return;
            }

            var allPlayersFinished =
                quizScores.Values.All(
                    player =>
                        player.IsFinished
                );

            if (!allPlayersFinished)
            {
                return;
            }

            var leaderboard =
                quizScores.Values
                    .OrderByDescending(
                        player => player.Score
                    )
                    .ThenBy(
                        player => player.Name
                    )
                    .Select(
                        (player, index) =>
                            new LeaderboardEntry(
                                index + 1,
                                player.Name,
                                player.Score
                            )
                    )
                    .ToList();

            await Clients.Group(
                quizId.ToString()
            ).SendAsync(
                "QuizFinished",
                leaderboard
            );
        }

        private static void ResetQuizScores(
            Guid quizId,
            int firstQuestionOrder)
        {
            if (!Scores.TryGetValue(
                    quizId,
                    out var quizScores))
            {
                return;
            }

            foreach (var player in quizScores.Values)
            {
                player.Score = 0;
                player.AnsweredQuestions.Clear();
                player.CurrentQuestionOrder =
                    firstQuestionOrder;
                player.IsFinished = false;
            }
        }

        public override async Task OnDisconnectedAsync(
            Exception? exception)
        {
            foreach (var quizEntry in Scores)
            {
                var player =
                    quizEntry.Value.Values
                        .FirstOrDefault(
                            player =>
                                player.ConnectionId ==
                                Context.ConnectionId
                        );

                if (player is null)
                {
                    continue;
                }

                quizEntry.Value.TryRemove(
                    player.Name,
                    out _
                );

                if (quizEntry.Value.IsEmpty)
                {
                    Scores.TryRemove(
                        quizEntry.Key,
                        out _
                    );
                }
            }

            await base.OnDisconnectedAsync(
                exception
            );
        }

        private sealed class PlayerScore
        {
            public string Name { get; }

            public string ConnectionId { get; }

            public int Score { get; set; }

            public int CurrentQuestionOrder { get; set; }

            public bool IsFinished { get; set; }

            public HashSet<Guid> AnsweredQuestions { get; } =
                new();

            public PlayerScore(
                string name,
                string connectionId)
            {
                Name = name;
                ConnectionId = connectionId;
                CurrentQuestionOrder = 0;
                IsFinished = false;
            }
        }

        private sealed record LeaderboardEntry(
            int Position,
            string PlayerName,
            int Score
        );
    }
}