
using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;

namespace LiveQuiz.Application.Services
{
    public class AnswerService : IAnswerService
    {
        private readonly IAnswerRepository _repository;
        public AnswerService(IAnswerRepository repository)
        {
            _repository=repository;
        }

        public async Task<Answer> CreateAnswerAsync(AnswerDto dto)
        {
            var answer = new Answer(
                dto.QuestionId,
                dto.Text,
                dto.IsCorrect
            );

            await _repository.CreateAnswerAsync(answer);

            return answer;
        }

        public async Task<IReadOnlyList<Answer>> GetAnswersByQuestionIdAsync(Guid questionId)
        {
            return await _repository.GetAnswersByQuestionIdAsync(questionId);
        }
    }
}