using LiveQuiz.Application.DTOs;
using LiveQuiz.Domain.Entities;

namespace LiveQuiz.Application.Interfaces;

public interface IQuizSessionService
{
    bool AddPlayer(
        Guid quizId,
        PlayerScore player);

    PlayerScore? GetPlayer(
        Guid quizId,
        string connectionId);

    IReadOnlyCollection<PlayerScore> GetPlayers(
        Guid quizId);

    bool RemovePlayer(
        string connectionId);

    void ResetPlayers(
        Guid quizId,
        int firstQuestionOrder);

    AnswerSubmissionResultDto? HandleAnswerSubmission(
        Guid quizId,
        Guid questionId,
        bool isCorrect,
        string connectionId,
        IReadOnlyList<QuestionDto> allQuestions
    );
}