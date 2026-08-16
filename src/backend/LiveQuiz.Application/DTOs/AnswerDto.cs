
namespace LiveQuiz.Application.DTOs
{
    public record AnswerDto(
        Guid QuestionId,
        string Text,
        bool IsCorrect
    );
}