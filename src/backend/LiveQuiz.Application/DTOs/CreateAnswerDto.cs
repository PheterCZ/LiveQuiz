
namespace LiveQuiz.Application.DTOs
{
    public record CreateAnswerDto(
        Guid QuestionId,
        string Text,
        bool IsCorrect
    );
}
