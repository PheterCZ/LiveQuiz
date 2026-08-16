
using LiveQuiz.Application.DTOs;
using LiveQuiz.Domain.Entities;

namespace LiveQuiz.Application.Interfaces
{
    public interface IQuestionService
    {
        Task<Question> AddQuestionServiceAsync(CreateQuestionDto dto);
        Task<IReadOnlyList<Question>> GetAllQuestionsAsync(Guid quizId);
        Task<bool> DeleteQuestionAsync(Guid id);

    }
}