
using System.Data;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;
using LiveQuiz.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LiveQuiz.Infrastructure.Repositories
{
    public class AnswerRepository : IAnswerRepository
    {
        private readonly ApplicationDbContext _context;
        public AnswerRepository(ApplicationDbContext context)
        {
            _context= context;
        }

        public async Task CreateAnswerAsync(Answer answer)
        {
            _context.Answers.Add(answer);
            await _context.SaveChangesAsync();
        }

        public async Task<IReadOnlyList<Answer>> GetAnswersByQuestionIdAsync(Guid questionId)
        {
            return await _context.Answers
                .Where(a => a.QuestionId == questionId)
                .ToListAsync();
        }
    }
}