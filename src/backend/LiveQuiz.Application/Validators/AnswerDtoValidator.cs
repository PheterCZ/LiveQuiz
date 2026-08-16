

using FluentValidation;
using LiveQuiz.Application.DTOs;

namespace LiveQuiz.Application.Validators
{
    public class AnswerDtoValidator : AbstractValidator<AnswerDto>
    {
        public AnswerDtoValidator()
        {
            RuleFor(answer => answer.QuestionId)
                .NotEmpty().WithMessage("Id cannot be null.");
        
            RuleFor(answer => answer.Text)
                .NotEmpty().WithMessage("Answer text cannot be empty")
                .MaximumLength(100);
        }

    }
}