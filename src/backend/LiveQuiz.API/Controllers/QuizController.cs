using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Services;
using LiveQuiz.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LiveQuiz.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuizController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        [HttpGet("all")]
        public async Task<ActionResult<IReadOnlyList<QuizDto>>> GetAllAsync()
        {
            var result = await _quizService.GetAllQuizzesAsync();

            return Ok(result);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<QuizDto>> GetQuizAsync(Guid id)
        {
            var result = await _quizService.GetQuizAsync(id);

            if (result is null)
            {
                return NotFound();
            }

            return Ok(result);
        }
        [HttpPost]
        public async Task<IActionResult> CreateQuizAsync([FromBody] CreateQuizDto quizDto)
        {
            var result = await _quizService.CreateQuizServiceAsync(quizDto);

            return Created("", result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuizAsync(Guid id)
        {
            var deleted = await _quizService.DeleteQuizAsync(id);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        
    }
}