
namespace LiveQuiz.Application.DTOs
{
    public record QuizDto(
        Guid Id,
        string Title,
        DateTime CreatedAt,
        string Description,
        IReadOnlyCollection<QuestionDto> Questions 
    );
}