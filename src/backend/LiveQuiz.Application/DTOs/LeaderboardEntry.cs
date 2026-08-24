namespace LiveQuiz.Application.DTOs;

public record LeaderboardEntryDto(
    int Position,
    string PlayerName,
    int Score
);