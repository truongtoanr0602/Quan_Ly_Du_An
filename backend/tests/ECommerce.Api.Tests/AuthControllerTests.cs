using System.Net;
using System.Net.Http.Json;
using ECommerce.Api.DTOs.Auth;
using ECommerce.Api.Exceptions;
using ECommerce.Api.Services.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ECommerce.Api.Tests;

public sealed class AuthControllerTests
{
    [Fact]
    public async Task RegisterReturnsCreatedWhenServiceReturnsAuthenticationResponse()
    {
        var response = AuthResponse();
        var controller = new Controllers.AuthController(new StubAuthService(registerResult: response));

        var result = await controller.Register(
            new RegisterDto
            {
                Email = "customer@example.test",
                Password = "password",
                FullName = "Customer"
            },
            CancellationToken.None);

        var created = Assert.IsType<CreatedResult>(result);
        Assert.Same(response, created.Value);
        Assert.Equal("/api/auth/register", created.Location);
    }

    [Fact]
    public async Task LoginLetsInvalidCredentialsReachMiddleware()
    {
        await using var factory = new TestApiFactory(configureTestServices: services =>
        {
            services.RemoveAll<IAuthService>();
            services.AddSingleton<IAuthService>(new StubAuthService(loginException: new InvalidCredentialsException()));
        });
        using var client = factory.CreateClient();

        using var httpResponse = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginDto { Email = "customer@example.test", Password = "wrong" });

        Assert.Equal(HttpStatusCode.Unauthorized, httpResponse.StatusCode);
        Assert.Equal("application/problem+json", httpResponse.Content.Headers.ContentType?.MediaType);
        var body = await httpResponse.Content.ReadAsStringAsync();
        Assert.Contains("Invalid email or password.", body);
        Assert.DoesNotContain("raw", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("exception", body, StringComparison.OrdinalIgnoreCase);
    }

    private static AuthResponseDto AuthResponse() => new()
    {
        Token = "token",
        User = new UserInfoDto
        {
            Id = 1,
            Email = "customer@example.test",
            FullName = "Customer",
            Role = "Customer"
        }
    };

    private sealed class StubAuthService(
        AuthResponseDto? registerResult = null,
        Exception? loginException = null) : IAuthService
    {
        public Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto, CancellationToken cancellationToken = default)
        {
            return registerResult is not null
                ? Task.FromResult(registerResult)
                : Task.FromException<AuthResponseDto>(new InvalidOperationException("No registration result configured."));
        }

        public Task<AuthResponseDto> LoginAsync(LoginDto loginDto, CancellationToken cancellationToken = default)
        {
            return loginException is not null
                ? Task.FromException<AuthResponseDto>(loginException)
                : Task.FromResult(AuthResponse());
        }
    }
}
