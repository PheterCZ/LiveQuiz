namespace LiveQuiz.Application.DTOs
{
    public record PlayerQuestionDto(
        Guid Id,
        string Text,
        int Order,
        IReadOnlyCollection<PlayerAnswerDto> Answers
    );
}