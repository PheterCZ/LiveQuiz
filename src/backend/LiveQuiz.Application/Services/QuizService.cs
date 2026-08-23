using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;

namespace LiveQuiz.Application.Services
{
    public class QuizService : IQuizService
    {
        private readonly IQuizRepository _repository;

        public QuizService(IQuizRepository repository)
        {
            _repository=repository;
        }


        public async Task<IReadOnlyList<QuizDto>> GetAllQuizzesAsync()
        {
            var quizzes = await _repository.GetAllQuizzesAsync();

            return quizzes.Select(quiz => new QuizDto(
                quiz.Id,
                quiz.Title,
                quiz.CreatedAt,
                quiz.Description,
                Array.Empty<QuestionDto>()
            )).ToList();
        }


        public async Task<CreatedQuizDto> CreateQuizServiceAsync(CreateQuizDto dto)
        {
            var quizEntity = new Quiz(dto.Title, dto.Description);

            await _repository.CreateQuizAsync(quizEntity);

            return new CreatedQuizDto(
                quizEntity.Id,
                quizEntity.HostToken
            );
        }

        public async Task<QuizDto?> GetQuizAsync(Guid id)
        {
            var quiz = await _repository.GetQuizAsync(id);

            if (quiz is null)
            {
                return null;
            }

            return new QuizDto(
                quiz.Id,
                quiz.Title,
                quiz.CreatedAt,
                quiz.Description,
                Array.Empty<QuestionDto>()
            );
        }

        public async Task<bool> DeleteQuizAsync(Guid id)
        {
            var quiz = await _repository.GetQuizAsync(id);

            if (quiz is null)
            {
                return false;
            }

            await _repository.DeleteQuizAsync(quiz);

            return true;
        }

        public async Task<bool> ValidateHostTokenAsync(
            Guid quizId,
            string hostToken)
        {
            var quiz = await _repository.GetQuizAsync(quizId);

            if (quiz is null)
            {
                return false;
            }

            return quiz.HostToken == hostToken;
        }
    }
}