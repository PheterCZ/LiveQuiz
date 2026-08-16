    namespace LiveQuiz.Domain.Entities;

    public class Quiz
    {
        public Guid Id { get; private set; }

        public string Title { get; private set; } = string.Empty;

        public DateTime CreatedAt { get; private set; }

        public string Description { get; private set; } = string.Empty;

        private readonly List<Question> _questions = new();

        public IReadOnlyCollection<Question> Questions => _questions;

        public Quiz(){}

        public Quiz(string title, string description)
        {
            Id=Guid.NewGuid();
            Title=title;
            Description=description;
            CreatedAt=DateTime.UtcNow;
        }
    }