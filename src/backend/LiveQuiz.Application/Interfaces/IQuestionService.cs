using LiveQuiz.Application.DTOs;

namespace LiveQuiz.Application.Interfaces
{
    public interface IQuestionService
    {
        Task<QuestionDto> AddQuestionServiceAsync(CreateQuestionDto dto);
        Task<IReadOnlyList<QuestionDto>> GetAllQuestionsAsync(Guid quizId);

        Task<PlayerQuestionDto?> GetPlayerQuestionAsync(
            Guid quizId,
            int order
        );
        Task<bool> DeleteQuestionAsync(Guid id);

        Task<int?> GetFirstQuestionOrderAsync(Guid quizId);

        Task<int?> GetNextQuestionOrderAsync(
            Guid quizId,
            int currentOrder
        );

        Task<QuestionDto?> GetQuestionByIdAsync(Guid questionId);
    }
}