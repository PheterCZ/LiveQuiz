
using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;
using LiveQuiz.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LiveQuiz.Infrastructure.Repositories
{
    public class QuizRepository : IQuizRepository
    {
        private readonly ApplicationDbContext _context;

        public QuizRepository(ApplicationDbContext context)
        {
            _context=context;
        }

        public async Task CreateQuizAsync(Quiz quiz)
        {
            _context.Quizzes.Add(quiz);

            await _context.SaveChangesAsync();
        }

        public async Task<IReadOnlyList<Quiz>> GetAllQuizzesAsync()
        {
            return await _context.Quizzes.ToListAsync();
        }

        public async Task<Quiz?> GetQuizAsync(Guid id)
        {
            return await _context.Quizzes.FindAsync(id);
        }
        public async Task DeleteQuizAsync(Quiz quiz)
        {
            _context.Quizzes.Remove(quiz);

            await _context.SaveChangesAsync();
        }
    }
}