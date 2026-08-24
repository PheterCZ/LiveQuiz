using System.Collections.Concurrent;
using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;

namespace LiveQuiz.Application.Services;

public class QuizSessionService : IQuizSessionService
{
    private readonly ConcurrentDictionary<
        Guid,
        ConcurrentDictionary<string, PlayerScore>
    > _scores = new();

    public bool AddPlayer(
        Guid quizId,
        PlayerScore player)
    {
        var quizScores =
            _scores.GetOrAdd(
                quizId,
                _ => new ConcurrentDictionary<string, PlayerScore>()
            );

        return quizScores.TryAdd(
            player.Name,
            player
        );
    }

    public PlayerScore? GetPlayer(
        Guid quizId,
        string connectionId)
    {
        if (!_scores.TryGetValue(
                quizId,
                out var quizScores))
        {
            return null;
        }

        return quizScores.Values.FirstOrDefault(
            player =>
                player.ConnectionId == connectionId
        );
    }

    public IReadOnlyCollection<PlayerScore> GetPlayers(
        Guid quizId)
    {
        if (!_scores.TryGetValue(
                quizId,
                out var quizScores))
        {
            return Array.Empty<PlayerScore>();
        }

        return quizScores.Values.ToList();
    }

    public bool RemovePlayer(
        string connectionId)
    {
        foreach (var quizEntry in _scores)
        {
            var quizId = quizEntry.Key;
            var quizScores = quizEntry.Value;

            var player =
                quizScores.Values.FirstOrDefault(
                    player =>
                        player.ConnectionId ==
                        connectionId
                );

            if (player is null)
            {
                continue;
            }

            var removed =
                quizScores.TryRemove(
                    player.Name,
                    out _
                );

            if (quizScores.IsEmpty)
            {
                _scores.TryRemove(
                    quizId,
                    out _
                );
            }

            return removed;
        }

        return false;
    }

    public void ResetPlayers(
        Guid quizId,
        int firstQuestionOrder)
    {
        if (!_scores.TryGetValue(
                quizId,
                out var quizScores))
        {
            return;
        }

        foreach (var player in quizScores.Values)
        {
            player.Reset(
                firstQuestionOrder
            );
        }
    }

    public AnswerSubmissionResultDto? HandleAnswerSubmission(
        Guid quizId,
        Guid questionId,
        bool isCorrect,
        string connectionId,
        IReadOnlyList<QuestionDto> allQuestions)
    {
        var player = GetPlayer(quizId, connectionId);
        if (player is null)
        {
            return null;
        }

        if (!player.HasAnswered(questionId))
        {
            player.AnswerQuestion(questionId);
            if (isCorrect)
            {
                player.AddPoint();
            }
        }

        var currentQuestion = allQuestions.FirstOrDefault(q => q.Order == player.CurrentQuestionOrder);
        if (currentQuestion is null)
        {
            return null;
        }

        var nextQuestionOrder = allQuestions
            .Where(q => q.Order > currentQuestion.Order)
            .OrderBy(q => q.Order)
            .Select(q => q.Order)
            .FirstOrDefault();

        if (nextQuestionOrder == 0)
        {
            player.Finish();
        }
        else
        {
            player.MoveToQuestion(nextQuestionOrder);
        }

        return new AnswerSubmissionResultDto(
            isCorrect,
            player.Score,
            nextQuestionOrder == 0 ? null : nextQuestionOrder
        );
    }
}