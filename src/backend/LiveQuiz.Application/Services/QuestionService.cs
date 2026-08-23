using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;

namespace LiveQuiz.Application.Services
{
    public class QuestionService : IQuestionService
    {
        private readonly IQuestionRepository _repository;

        public QuestionService(IQuestionRepository repository)
        {
            _repository = repository;
        }

        public async Task<QuestionDto> AddQuestionServiceAsync(
            CreateQuestionDto dto)
        {
            var order =
                await _repository.GetNextQuestionOrderAsync(dto.QuizId);

            var question = new Question(
                dto.QuizId,
                dto.Text,
                order
            );

            await _repository.AddQuestionAsync(question);

            return new QuestionDto(
                question.Id,
                question.Text,
                question.Order,
                question.Answers
                    .Select(a => new AnswerDto(
                        a.Id,
                        a.Text,
                        a.IsCorrect
                    ))
                    .ToList()
            );
        }

        public async Task<IReadOnlyList<QuestionDto>> GetAllQuestionsAsync(
            Guid quizId)
        {
            var questions =
                await _repository.GetQuestionsByQuizIdAsync(quizId);

            return questions
                .Select(q => new QuestionDto(
                    q.Id,
                    q.Text,
                    q.Order,
                    q.Answers
                        .Select(a => new AnswerDto(
                            a.Id,
                            a.Text,
                            a.IsCorrect
                        ))
                        .ToList()
                ))
                .ToList();
        }

        public async Task<PlayerQuestionDto?> GetPlayerQuestionAsync(
            Guid quizId,
            int order)
        {
            var question = await _repository.GetQuestionByOrderAsync(
                quizId,
                order
            );

            if (question is null)
            {
                return null;
            }

            return new PlayerQuestionDto(
                question.Id,
                question.Text,
                question.Order,
                question.Answers
                    .Select(a => new PlayerAnswerDto(
                        a.Id,
                        a.Text
                    ))
                    .ToList()
            );
        }

        public async Task<bool> DeleteQuestionAsync(Guid id)
        {
            var question =
                await _repository.GetQuestionByIdAsync(id);

            if (question is null)
            {
                return false;
            }

            await _repository.DeleteQuestionAsync(question);

            return true;
        }
    }
}