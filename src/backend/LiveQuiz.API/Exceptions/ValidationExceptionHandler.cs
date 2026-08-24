using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace LiveQuiz.API.Exceptions;

internal sealed class ValidationExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<ValidationExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not ValidationException validationException)
        {
            return false;
        }

        logger.LogWarning(
            "Validation failed for request {Path}",
            httpContext.Request.Path
        );

        httpContext.Response.StatusCode =
            StatusCodes.Status400BadRequest;

        var errors = validationException.Errors
            .GroupBy(error => error.PropertyName)
            .ToDictionary(
                group => group.Key.ToLowerInvariant(),
                group => group
                    .Select(error => error.ErrorMessage)
                    .ToArray()
            );

        var context = new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = validationException,
            ProblemDetails = new ProblemDetails
            {
                Title = "Validation failed",
                Detail = "One or more validation errors occurred.",
                Status = StatusCodes.Status400BadRequest
            }
        };

        context.ProblemDetails.Extensions["errors"] = errors;

        return await problemDetailsService.TryWriteAsync(
            context
        );
    }
}