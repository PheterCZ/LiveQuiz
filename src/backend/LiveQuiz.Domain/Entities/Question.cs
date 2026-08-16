namespace LiveQuiz.Domain.Entities
{
    public class Question
    {
        public Guid Id { get; init; } = Guid.NewGuid();

        public Guid QuizId { get; private set; }

        public string Text { get; private set; } = string.Empty;

        private readonly List<Answer> _answers = new();

        public IReadOnlyCollection<Answer> Answers => _answers;

        public Question(Guid quizId, string text)
        {
            QuizId = quizId;
            Text = text;
        }
    }
}