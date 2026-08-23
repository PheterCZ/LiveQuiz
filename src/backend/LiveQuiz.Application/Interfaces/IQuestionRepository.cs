
using LiveQuiz.Domain.Entities;

namespace LiveQuiz.Application.Interfaces
{
    public interface IQuestionRepository
    {
        Task AddQuestionAsync(Question question);        
        Task<IReadOnlyList<Question>> GetQuestionsByQuizIdAsync(Guid quizId);   
        Task<Question?> GetQuestionByIdAsync(Guid id);
            Task<Question?> GetQuestionByOrderAsync(
            Guid quizId,
            int order);
        Task DeleteQuestionAsync(Question question);
        Task<int> GetNextQuestionOrderAsync(Guid quizId);
    }
}