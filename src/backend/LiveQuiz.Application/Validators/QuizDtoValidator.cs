
using System.Data;
using FluentValidation;
using LiveQuiz.Application.DTOs;

namespace LiveQuiz.Application.Validators
{
    public class QuizDtoValidator : AbstractValidator<QuizDto>
    {
        public QuizDtoValidator()
        {
            RuleFor(quiz=>quiz.Id)
                .NotEmpty().WithMessage("Id cannot be empty.");
            
            RuleFor(quiz => quiz.Title)
                .NotEmpty().WithMessage("Title cannot be empty.")
                .NotNull().WithMessage("Title cannot be null")
                .MinimumLength(10)
                .MaximumLength(150);

            RuleFor(quiz => quiz.Description)
                .NotNull().WithMessage("Description cannot be null")
                .NotEmpty().WithMessage("Description cannot be empty")
                .MaximumLength(100)
                .MinimumLength(20);
                
            RuleFor(quiz=>quiz.Questions)
                .NotEmpty().WithMessage("Questions cannot be empty.")
                .NotNull().WithMessage("Questions cannot be null");
        }
    }
}