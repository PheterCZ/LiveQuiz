using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
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
        public async Task<ActionResult<AnswerDto>> CreateAnswer(
            CreateAnswerDto dto)
        {
            var answer = await _answerService.CreateAnswerAsync(dto);

            return Created("", answer);
        }

        [HttpGet("question/{questionId}")]
        public async Task<ActionResult<IReadOnlyList<AnswerDto>>> GetAnswers(
            Guid questionId)
        {
            var answers =
                await _answerService.GetAnswersByQuestionIdAsync(questionId);

            return Ok(answers);
        }
    }
}
