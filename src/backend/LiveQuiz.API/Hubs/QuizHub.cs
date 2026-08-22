using LiveQuiz.Application.Interfaces;
using LiveQuiz.Application.Services;
using Microsoft.AspNetCore.SignalR;

namespace LiveQuiz.API.Hubs
{
    public class QuizHub : Hub
    {
        private readonly IQuizService _quizService;
        private readonly IAnswerService _answerService;
        private readonly IQuestionService _questionService;

        public QuizHub(
            IQuizService quizService,
            IAnswerService answerService,
            IQuestionService questionService)
        {
            _quizService = quizService;
            _answerService = answerService;
            _questionService = questionService;
        }

        public async Task JoinQuiz(Guid quizId)
        {
            var quiz = await _quizService.GetQuizAsync(quizId);

            if (quiz is null)
            {
                throw new HubException("Quiz not found.");
            }

            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                quizId.ToString()
            );

            await Clients.Group(quizId.ToString())
                .SendAsync(
                    "UserJoined",
                    Context.ConnectionId
                );
        }

        public async Task StartQuiz(Guid quizId)
        {
            var quiz = await _quizService.GetQuizAsync(quizId);

            if (quiz is null)
            {
                throw new HubException("Quiz not found.");
            }

            var questions =
                await _questionService.GetAllQuestionsAsync(quizId);

            var firstOrder = questions
                .OrderBy(q => q.Order)
                .Select(q => q.Order)
                .FirstOrDefault();

            if (firstOrder == 0)
            {
                throw new HubException("Quiz has no questions.");
            }

            await Clients.Group(quizId.ToString())
                .SendAsync("QuizStarted", firstOrder);
        }

        public async Task NextQuestion(
            Guid quizId,
            int questionOrder)
        {
            var quiz = await _quizService.GetQuizAsync(quizId);

            if (quiz is null)
            {
                throw new HubException("Quiz not found.");
            }

            await Clients.Group(quizId.ToString())
                .SendAsync(
                    "QuestionChanged",
                    questionOrder
                );
        }

        public async Task SubmitAnswer(
            Guid quizId,
            Guid questionId,
            Guid answerId)
        {
            var quiz = await _quizService.GetQuizAsync(quizId);

            if (quiz is null)
            {
                throw new HubException("Quiz not found.");
            }

            var answers =
                await _answerService.GetAnswersByQuestionIdAsync(
                    questionId
                );

            var answer = answers.FirstOrDefault(
                a => a.Id == answerId
            );

            if (answer is null)
            {
                throw new HubException("Answer not found.");
            }

            await Clients.Caller.SendAsync(
                "AnswerSubmitted",
                answerId,
                answer.IsCorrect
            );
        }
    }
}