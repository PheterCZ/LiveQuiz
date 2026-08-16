using LiveQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LiveQuiz.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): base(options) { }
        
        public DbSet<Quiz> Quizzes {get;set;}
        public DbSet<Question> Questions {get;set;}
        public DbSet<Answer> Answers {get;set;}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Question>()
                .HasMany(a => a.Answers)
                .WithOne()
                .HasForeignKey("QuestionId");

            modelBuilder.Entity<Answer>()
                .HasOne(q => q.Question)
                .WithMany(a => a.Answers)
                .HasForeignKey(k => k.QuestionId);

            modelBuilder.Entity<Quiz>()
                .HasMany(q => q.Questions)
                .WithOne()
                .HasForeignKey(q => q.QuizId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}