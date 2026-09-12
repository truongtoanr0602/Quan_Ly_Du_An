using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ECommerce.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            var (statusCode, title) = exception switch
            {
                InvalidOperationException => (StatusCodes.Status400BadRequest, exception.Message),
                KeyNotFoundException => (StatusCodes.Status404NotFound, exception.Message),
                UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, exception.Message),
                Microsoft.EntityFrameworkCore.DbUpdateException dbEx => (StatusCodes.Status400BadRequest, dbEx.InnerException?.Message ?? dbEx.Message),
                _ => (StatusCodes.Status500InternalServerError, exception.Message)
            };

            if (statusCode == StatusCodes.Status500InternalServerError)
                logger.LogError(exception, "An unhandled exception occurred while processing the request: {Message}", exception.Message);
            else
                logger.LogWarning(exception, "A handled exception occurred: {Message}", exception.Message);

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/problem+json";

            var problem = new ProblemDetails
            {
                Status = statusCode,
                Title = title
            };

            await JsonSerializer.SerializeAsync(
                context.Response.Body,
                problem,
                cancellationToken: context.RequestAborted);
        }
    }
}
