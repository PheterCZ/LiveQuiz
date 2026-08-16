
using FluentValidation;
using LiveQuiz.Application.DTOs;

namespace LiveQuiz.Application.Validators
{
    public class QuestionDtoValidator : AbstractValidator<QuestionDto>
    {
        public QuestionDtoValidator()
        {
            RuleFor(question => question.Id)
                .NotEmpty()
                .WithMessage("Id cannot be empty.");

            RuleFor(question => question.Text)
                .NotEmpty()
                .WithMessage("Question text cannot be empty.")
                .MaximumLength(100);

            RuleFor(question => question.Answers)
                .NotEmpty()
                .WithMessage("Question must contain at least one answer.");

            RuleForEach(question => question.Answers)
                .SetValidator(new AnswerDtoValidator());
                
        }        
    }
}