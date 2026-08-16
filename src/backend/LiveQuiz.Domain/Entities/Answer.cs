using System.Text.Json.Serialization;

namespace LiveQuiz.Domain.Entities
{
    public class Answer
    {
        public Guid Id { get; init; } = Guid.NewGuid();

        public Guid QuestionId { get; private set; }

        [JsonIgnore]
        public Question Question { get; private set; } = null!;

        public string Text { get; private set; } = string.Empty;

        public bool IsCorrect { get; private set; }

        public Answer(Guid questionId, string text, bool isCorrect)
        {
            QuestionId = questionId;
            Text = text;
            IsCorrect = isCorrect;
        }
    }
}