namespace LiveQuiz.Application.DTOs;

public record AnswerSubmissionResultDto(
    bool IsCorrect,
    int PlayerScore,
    int? NextQuestionOrder
);
