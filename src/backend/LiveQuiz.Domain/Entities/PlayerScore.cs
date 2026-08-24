namespace LiveQuiz.Domain.Entities;

public class PlayerScore
{
    private readonly HashSet<Guid> _answeredQuestions = new();

    public string Name { get; init;}

    public string ConnectionId { get; init;}

    public int Score { get; private set; }

    public int CurrentQuestionOrder { get; private set; }

    public bool IsFinished { get; private set; }

    public IReadOnlySet<Guid> AnsweredQuestions =>
        _answeredQuestions;

    public PlayerScore(
        string name,
        string connectionId)
    {
        Name = name;
        ConnectionId = connectionId;
        CurrentQuestionOrder = 0;
        IsFinished = false;
    }

    public bool HasAnswered(Guid questionId)
    {
        return _answeredQuestions.Contains(questionId);
    }

    public void AnswerQuestion(Guid questionId)
    {
        _answeredQuestions.Add(questionId);
    }

    public void AddPoint()
    {
        Score++;
    }

    public void MoveToQuestion(int questionOrder)
    {
        CurrentQuestionOrder = questionOrder;
    }

    public void Finish()
    {
        IsFinished = true;
    }

    public void Reset(int firstQuestionOrder)
    {
        Score = 0;
        _answeredQuestions.Clear();
        CurrentQuestionOrder = firstQuestionOrder;
        IsFinished = false;
    }
}