
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
            _repository = repository;
        }

        public async Task<AnswerDto> CreateAnswerAsync(CreateAnswerDto dto)
        {
            var answer = new Answer(
                dto.QuestionId,
                dto.Text,
                dto.IsCorrect
            );

            await _repository.CreateAnswerAsync(answer);

            return new AnswerDto(
                answer.Id,
                answer.Text,
                answer.IsCorrect
            );
        }

        public async Task<IReadOnlyList<AnswerDto>> GetAnswersByQuestionIdAsync(
            Guid questionId)
        {
            var answers =
                await _repository.GetAnswersByQuestionIdAsync(questionId);

            return answers
                .Select(a => new AnswerDto(
                    a.Id,
                    a.Text,
                    a.IsCorrect
                ))
                .ToList();
        }
    }
}
