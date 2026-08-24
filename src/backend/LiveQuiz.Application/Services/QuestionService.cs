using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace LiveQuiz.Application.Services
{
    public class QuestionService : IQuestionService
    {
        private readonly IQuestionRepository _repository;
        private readonly ILogger<QuestionService> _logger;

        public QuestionService(
            IQuestionRepository repository,
            ILogger<QuestionService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<QuestionDto> AddQuestionServiceAsync(
            CreateQuestionDto dto)
        {
            var order =
                await _repository.GetNextQuestionOrderAsync(dto.QuizId);

            var question = new Question(
                dto.QuizId,
                dto.Text,
                order
            );

            await _repository.AddQuestionAsync(question);

            _logger.LogInformation(
                "Question {QuestionId} created for quiz {QuizId} with order {Order}.",
                question.Id,
                dto.QuizId,
                order
            );

            return new QuestionDto(
                question.Id,
                question.Text,
                question.Order,
                question.Answers
                    .Select(a => new AnswerDto(
                        a.Id,
                        a.Text,
                        a.IsCorrect
                    ))
                    .ToList()
            );
        }

        public async Task<IReadOnlyList<QuestionDto>> GetAllQuestionsAsync(
            Guid quizId)
        {
            var questions =
                await _repository.GetQuestionsByQuizIdAsync(quizId);

            return questions
                .Select(q => new QuestionDto(
                    q.Id,
                    q.Text,
                    q.Order,
                    q.Answers
                        .Select(a => new AnswerDto(
                            a.Id,
                            a.Text,
                            a.IsCorrect
                        ))
                        .ToList()
                ))
                .ToList();
        }

        public async Task<PlayerQuestionDto?> GetPlayerQuestionAsync(
            Guid quizId,
            int order)
        {
            var question =
                await _repository.GetQuestionByOrderAsync(
                    quizId,
                    order
                );

            if (question is null)
                return null;

            return new PlayerQuestionDto(
                question.Id,
                question.Text,
                question.Order,
                question.Answers
                    .Select(a => new PlayerAnswerDto(
                        a.Id,
                        a.Text
                    ))
                    .ToList()
            );
        }

        public async Task<bool> DeleteQuestionAsync(Guid id)
        {
            var question =
                await _repository.GetQuestionByIdAsync(id);

            if (question is null)
                return false;

            await _repository.DeleteQuestionAsync(question);

            _logger.LogInformation(
                "Question {QuestionId} deleted from quiz {QuizId}.",
                question.Id,
                question.QuizId
            );

            return true;
        }

        public async Task<int?> GetFirstQuestionOrderAsync(Guid quizId)
        {
            var questions =
                await _repository.GetQuestionsByQuizIdAsync(quizId);

            if (questions.Count == 0)
                return null;

            return questions
                .OrderBy(q => q.Order)
                .Select(q => q.Order)
                .FirstOrDefault();
        }

        public async Task<int?> GetNextQuestionOrderAsync(
            Guid quizId,
            int currentOrder)
        {
            var questions =
                await _repository.GetQuestionsByQuizIdAsync(quizId);

            var nextOrder = questions
                .Where(q => q.Order > currentOrder)
                .OrderBy(q => q.Order)
                .Select(q => q.Order)
                .FirstOrDefault();

            return nextOrder == 0 ? null : nextOrder;
        }

        public async Task<QuestionDto?> GetQuestionByIdAsync(
            Guid questionId)
        {
            var question =
                await _repository.GetQuestionByIdAsync(questionId);

            if (question is null)
                return null;

            return new QuestionDto(
                question.Id,
                question.Text,
                question.Order,
                question.Answers
                    .Select(a => new AnswerDto(
                        a.Id,
                        a.Text,
                        a.IsCorrect
                    ))
                    .ToList()
            );
        }
    }
}