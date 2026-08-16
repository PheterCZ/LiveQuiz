
using LiveQuiz.Domain.Entities;

namespace LiveQuiz.Application.Interfaces
{
    public interface IAnswerRepository
    {
        Task CreateAnswerAsync(Answer answer);
        Task<IReadOnlyList<Answer>> GetAnswersByQuestionIdAsync(Guid questionId);
    }
}