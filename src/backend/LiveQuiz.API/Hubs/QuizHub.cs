using LiveQuiz.Application.Services;
using Microsoft.AspNetCore.SignalR;

namespace LiveQuiz.API.Hubs;

public class QuizHub : Hub
{
    private readonly IQuizService _quizService;

    public QuizHub(IQuizService quizService)
    {
        _quizService = quizService;
    }

    public async Task JoinQuiz(Guid quizId)
    {
        var quiz = await _quizService.GetQuizAsync(quizId);

        if (quiz is null)
        {
            throw new HubException("Quiz not found.");
        }

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            quizId.ToString()
        );

        await Clients.Group(quizId.ToString())
            .SendAsync("UserJoined", Context.ConnectionId);
    }

    public async Task StartQuiz(Guid quizId)
    {
        var quiz = await _quizService.GetQuizAsync(quizId);

        if (quiz is null)
        {
            throw new HubException("Quiz not found.");
        }

        await Clients.Group(quizId.ToString())
            .SendAsync("QuizStarted");
    }
}