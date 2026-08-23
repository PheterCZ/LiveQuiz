using LiveQuiz.Domain.Entities;

namespace LiveQuiz.Application.Interfaces
{
    public interface IQuizRepository
    {
        Task CreateQuizAsync(Quiz quiz);

        Task<IReadOnlyList<Quiz>> GetAllQuizzesAsync();

        Task<Quiz?> GetQuizAsync(Guid id);

        Task UpdateQuizAsync(Quiz quiz);

        Task DeleteQuizAsync(Quiz quiz);
    }
}