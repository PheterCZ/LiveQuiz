using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LiveQuiz.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnswerController : ControllerBase
    {
        private readonly IAnswerService _answerService;

        public AnswerController(IAnswerService answerService)
        {
            _answerService = answerService;
        }

        [HttpPost]
        public async Task<ActionResult<Answer>> CreateAnswer(AnswerDto dto)
        {
            var answer = await _answerService.CreateAnswerAsync(dto);

            return Created("", answer);
        }

        [HttpGet("question/{questionId}")]
        public async Task<ActionResult<IReadOnlyList<Answer>>> GetAnswers(Guid questionId)
        {
            var answers = await _answerService.GetAnswersByQuestionIdAsync(questionId);

            return Ok(answers);
        }
    }
}