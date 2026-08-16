
using LiveQuiz.Application.DTOs;

namespace LiveQuiz.Application.Services
{

    public interface IQuizService
    {
        Task<QuizDto> CreateQuizServiceAsync(CreateQuizDto dto);

        Task<IReadOnlyList<QuizDto>> GetAllQuizzesAsync();
        Task<QuizDto?> GetQuizAsync(Guid id);
        Task<bool> DeleteQuizAsync(Guid id);
        
    }
}