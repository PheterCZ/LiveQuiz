
namespace LiveQuiz.Application.DTOs
{
    public record CreateQuestionDto(
        Guid quizId,
        string Text
    );
}