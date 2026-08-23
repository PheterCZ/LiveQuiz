namespace LiveQuiz.Domain.Entities
{
    public class Question
    {
        public Guid Id { get; init; } = Guid.NewGuid();

        public Guid QuizId { get; private set; }

        public string Text { get; private set; } = string.Empty;

        public int Order { get; private set; }

        private readonly List<Answer> _answers = new();

        public IReadOnlyCollection<Answer> Answers => _answers;

        private Question() { }

        public Question(Guid quizId, string text, int order)
        {
            QuizId = quizId;
            Text = text;
            Order = order;
        }
    }
}