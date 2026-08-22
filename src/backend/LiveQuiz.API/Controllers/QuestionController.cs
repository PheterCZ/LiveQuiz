using LiveQuiz.API.Hubs;
using LiveQuiz.Application.DTOs;
using LiveQuiz.Application.Interfaces;
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
        public async Task<ActionResult<IReadOnlyList<QuestionDto>>> GetQuestions(
            Guid quizId)
        {
            var questions =
                await _questionService.GetAllQuestionsAsync(quizId);

            return Ok(questions);
        }

        [HttpGet("quiz/{quizId}/order/{order}")]
        public async Task<ActionResult<PlayerQuestionDto>> GetPlayerQuestion(
            Guid quizId,
            int order)
        {
            var question =
                await _questionService.GetPlayerQuestionAsync(
                    quizId,
                    order);

            if (question is null)
            {
                return NotFound();
            }

            return Ok(question);
        }

        [HttpPost]
        public async Task<ActionResult<QuestionDto>> AddQuestion(
            CreateQuestionDto dto)
        {
            var question =
                await _questionService.AddQuestionServiceAsync(dto);

            await _hubContext
                .Clients
                .Group(dto.QuizId.ToString())
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