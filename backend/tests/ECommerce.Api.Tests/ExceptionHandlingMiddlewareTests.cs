using System.Net;
using System.Text.Json;
using ECommerce.Api.Exceptions;
using ECommerce.Api.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;

namespace ECommerce.Api.Tests;

public sealed class ExceptionHandlingMiddlewareTests
{
    [Theory]
    [InlineData(typeof(ResourceNotFoundException), HttpStatusCode.NotFound, "Resource was not found.")]
    [InlineData(typeof(DomainConflictException), HttpStatusCode.Conflict, "The request conflicts with existing state.")]
    [InlineData(typeof(InvalidCredentialsException), HttpStatusCode.Unauthorized, "Invalid email or password.")]
    [InlineData(typeof(DomainValidationException), HttpStatusCode.BadRequest, "The request is invalid.")]
    public async Task InvokeAsyncMapsExpectedFailureToProblemDetails(Type exceptionType, HttpStatusCode status, string title)
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        RequestDelegate next = _ => Task.FromException((Exception)Activator.CreateInstance(exceptionType)!);
        var middleware = new ExceptionHandlingMiddleware(next, NullLogger<ExceptionHandlingMiddleware>.Instance);

        await middleware.InvokeAsync(context);

        Assert.Equal((int)status, context.Response.StatusCode);
        Assert.Equal("application/problem+json", context.Response.ContentType);
        context.Response.Body.Position = 0;
        using var problem = await JsonDocument.ParseAsync(context.Response.Body);
        Assert.Equal(title, problem.RootElement.GetProperty("title").GetString());
        Assert.DoesNotContain("sensitive", problem.RootElement.ToString(), StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("exception", problem.RootElement.ToString(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task InvokeAsyncReturnsSafeProblemDetailsForUnhandledException()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        RequestDelegate next = _ => throw new InvalidOperationException("sensitive details");
        var middleware = new ExceptionHandlingMiddleware(
            next,
            NullLogger<ExceptionHandlingMiddleware>.Instance);

        await middleware.InvokeAsync(context);

        Assert.Equal((int)HttpStatusCode.InternalServerError, context.Response.StatusCode);
        Assert.Equal("application/problem+json", context.Response.ContentType);

        context.Response.Body.Position = 0;
        using var problem = await JsonDocument.ParseAsync(context.Response.Body);
        Assert.Equal("An unexpected error occurred.", problem.RootElement.GetProperty("title").GetString());
        Assert.DoesNotContain("sensitive details", problem.RootElement.ToString());
    }
}
