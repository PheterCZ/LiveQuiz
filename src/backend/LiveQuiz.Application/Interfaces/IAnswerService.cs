
using LiveQuiz.Application.DTOs;
using LiveQuiz.Domain.Entities;

namespace LiveQuiz.Application.Interfaces
{
    public interface IAnswerService
    {
        Task<Answer> CreateAnswerAsync(AnswerDto dto);
        Task<IReadOnlyList<Answer>> GetAnswersByQuestionIdAsync(Guid questionId);
    };
}