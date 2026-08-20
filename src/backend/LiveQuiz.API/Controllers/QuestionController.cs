using LiveQuiz.API.Hubs;
using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
using LiveQuiz.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace LiveQuiz.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionService _questionService;
        private readonly IHubContext<QuizHub> _hubContext;

        public QuestionController(
            IQuestionService questionService,
            IHubContext<QuizHub> hubContext)
        {
            _questionService = questionService;
            _hubContext = hubContext;
        }

        [HttpGet("quiz/{quizId}")]
        public async Task<ActionResult<IReadOnlyList<Question>>> GetQuestions(
            Guid quizId)
        {
            var questions =
                await _questionService.GetAllQuestionsAsync(quizId);

            return Ok(questions);
        }

        [HttpPost]
        public async Task<ActionResult<Question>> AddQuestion(
            CreateQuestionDto dto)
        {
            var question =
                await _questionService.AddQuestionServiceAsync(dto);

            await _hubContext
                .Clients
                .Group(question.QuizId.ToString())
                .SendAsync("QuestionCreated", question);

            return Created("", question);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(Guid id)
        {
            var deleted =
                await _questionService.DeleteQuestionAsync(id);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}