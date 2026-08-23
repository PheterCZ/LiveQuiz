
using FluentValidation;
using LiveQuiz.Application.DTOs;

namespace LiveQuiz.Application.Validators
{
    public class CreateAnswerDtoValidator : AbstractValidator<CreateAnswerDto>
    {
        public CreateAnswerDtoValidator()
        {
            RuleFor(answer => answer.QuestionId)
                .NotEmpty().WithMessage("QuestionId cannot be empty.");

            RuleFor(answer => answer.Text)
                .NotEmpty().WithMessage("Answer text cannot be empty")
                .MaximumLength(100);
        }
    }
}
