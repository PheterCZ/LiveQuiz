
using LiveQuiz.Application.DTOs;

namespace LiveQuiz.Application.Services
{
    public interface IQuizService
    {
        Task<CreatedQuizDto> CreateQuizServiceAsync(CreateQuizDto dto);

        Task<IReadOnlyList<QuizDto>> GetAllQuizzesAsync();
        Task<QuizDto?> GetQuizAsync(Guid id);
        Task<bool> DeleteQuizAsync(Guid id);
        Task<bool> ValidateHostTokenAsync(
            Guid quizId,
            string hostToken
        );
    }
}