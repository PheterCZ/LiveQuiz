using LiveQuiz.Application.DTOs;

namespace LiveQuiz.Application.Interfaces
{
    public interface IAnswerService
    {
        Task<AnswerDto> CreateAnswerAsync(CreateAnswerDto dto);
        Task<IReadOnlyList<AnswerDto>> GetAnswersByQuestionIdAsync(Guid questionId);
    };
}