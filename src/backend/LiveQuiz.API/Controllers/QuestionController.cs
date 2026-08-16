
using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LiveQuiz.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionService _questionService;
        public QuestionController(IQuestionService questionService)
        {
            _questionService = questionService;
        }

        [HttpGet("quiz/{quizId}")]
        public async Task<ActionResult<IReadOnlyList<Question>>> GetQuestions(Guid quizId)
        {
            var questions = await _questionService.GetAllQuestionsAsync(quizId);

            return Ok(questions);
        }

        [HttpPost]
        public async Task<ActionResult<Question>> AddQuestion(CreateQuestionDto dto)
        {
            var question = await _questionService.AddQuestionServiceAsync(dto);

            return Created("", question);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(Guid id)
        {
            var deleted = await _questionService.DeleteQuestionAsync(id);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}