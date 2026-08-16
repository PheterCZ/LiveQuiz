
namespace LiveQuiz.Application.DTOs
{
    public record QuestionDto(
        Guid Id,
        string Text,
        IReadOnlyCollection<AnswerDto> Answers
    );
}