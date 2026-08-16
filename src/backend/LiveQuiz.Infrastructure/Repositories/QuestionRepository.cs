
using System.Data.Common;
using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;
using LiveQuiz.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LiveQuiz.Infrastructure.Repositories
{
    public class QuestionRepository : IQuestionRepository
    {
        private readonly ApplicationDbContext _context;
        public QuestionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddQuestionAsync(Question question)
        {
            _context.Questions.Add(question);
            await _context.SaveChangesAsync();
        }

        public async Task<IReadOnlyList<Question>> GetQuestionsByQuizIdAsync(Guid quizId)
        {
            return await _context.Questions
                .Where(q => q.QuizId == quizId)
                .Include(q => q.Answers)
                .ToListAsync();
        }

        public async Task<Question?> GetQuestionByIdAsync(Guid id)
        {
            return await _context.Questions
                .FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task DeleteQuestionAsync(Question question)
        {
            _context.Questions.Remove(question);

            await _context.SaveChangesAsync();
        }
    }
}