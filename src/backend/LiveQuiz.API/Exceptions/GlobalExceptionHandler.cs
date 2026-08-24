using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace LiveQuiz.API.Exceptions;

internal sealed class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(
            exception,
            "Unhandled exception occurred for request {Path}",
            httpContext.Request.Path
        );

        httpContext.Response.StatusCode =
            StatusCodes.Status500InternalServerError;

        var context = new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred.",
                Status = StatusCodes.Status500InternalServerError
            }
        };

        context.ProblemDetails.Extensions["traceId"] =
            httpContext.TraceIdentifier;

        return await problemDetailsService.TryWriteAsync(
            context
        );
    }
}