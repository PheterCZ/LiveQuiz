namespace LiveQuiz.Application.DTOs
{
    public record CreatedQuizDto(
        Guid Id,
        string HostToken
    );
}