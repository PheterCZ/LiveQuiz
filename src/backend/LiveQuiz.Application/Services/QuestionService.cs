
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
        public async Task<Question> AddQuestionServiceAsync(CreateQuestionDto dto)
        {
            var question = new Question(dto.quizId,dto.Text);

            await _repository.AddQuestionAsync(question);

            return question;
        }
        public async Task<IReadOnlyList<Question>> GetAllQuestionsAsync(Guid quizId)
        {
            return await _repository.GetQuestionsByQuizIdAsync(quizId);   
        }

        public async Task<bool> DeleteQuestionAsync(Guid id)
        {
            var question = await _repository.GetQuestionByIdAsync(id);
            if (question is null)
            {
                return false;
            }

            await _repository.DeleteQuestionAsync(question);
            return true;
        }
    }
}