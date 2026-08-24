using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace LiveQuiz.Application.Services
{
    public class QuizService : IQuizService
    {
        private readonly IQuizRepository _repository;
        private readonly ILogger<QuizService> _logger;

        public QuizService(
            IQuizRepository repository,
            ILogger<QuizService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IReadOnlyList<QuizDto>> GetAllQuizzesAsync()
        {
            var quizzes = await _repository.GetAllQuizzesAsync();

            return quizzes.Select(quiz => new QuizDto(
                quiz.Id,
                quiz.Title,
                quiz.CreatedAt,
                quiz.Description,
                quiz.IsStarted,
                Array.Empty<QuestionDto>()
            )).ToList();
        }

        public async Task<CreatedQuizDto> CreateQuizServiceAsync(
            CreateQuizDto dto)
        {
            var quizEntity = new Quiz(dto.Title, dto.Description);

            await _repository.CreateQuizAsync(quizEntity);

            _logger.LogInformation(
                "Quiz {QuizId} created.",
                quizEntity.Id
            );

            return new CreatedQuizDto(
                quizEntity.Id,
                quizEntity.HostToken
            );
        }

        public async Task<QuizDto?> GetQuizAsync(Guid id)
        {
            var quiz = await _repository.GetQuizAsync(id);

            if (quiz is null)
                return null;

            return new QuizDto(
                quiz.Id,
                quiz.Title,
                quiz.CreatedAt,
                quiz.Description,
                quiz.IsStarted,
                Array.Empty<QuestionDto>()
            );
        }

        public async Task<bool> DeleteQuizAsync(Guid id)
        {
            var quiz = await _repository.GetQuizAsync(id);

            if (quiz is null)
                return false;

            await _repository.DeleteQuizAsync(quiz);

            _logger.LogInformation(
                "Quiz {QuizId} deleted.",
                id
            );

            return true;
        }

        public async Task<bool> StartQuizAsync(
            Guid quizId,
            string hostToken)
        {
            var quiz = await _repository.GetQuizAsync(quizId);

            if (quiz is null ||
                quiz.HostToken != hostToken ||
                quiz.IsStarted)
            {
                return false;
            }

            quiz.Start();
            await _repository.UpdateQuizAsync(quiz);

            _logger.LogInformation(
                "Quiz {QuizId} started.",
                quizId
            );

            return true;
        }

        public async Task<bool> ValidateHostTokenAsync(
            Guid quizId,
            string hostToken)
        {
            var quiz = await _repository.GetQuizAsync(quizId);

            return quiz is not null &&
                   quiz.HostToken == hostToken;
        }
    }
}