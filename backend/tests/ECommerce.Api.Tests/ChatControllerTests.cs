using System.Net;
using System.Net.Http.Json;
using ECommerce.Api.DTOs.Chat;
using ECommerce.Api.Services.Chat;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Tests;

public sealed class ChatControllerTests
{
    [Fact]
    public async Task PublicChatRouteValidatesMessageAndReturnsAssistantReply()
    {
        using var factory = new TestApiFactory(configureTestServices: services =>
            services.AddSingleton<IChatService>(new RecordingChatService()));
        using var client = factory.CreateClient();

        using var empty = await client.PostAsJsonAsync("/api/chat", new { message = "  " });
        Assert.Equal(HttpStatusCode.BadRequest, empty.StatusCode);

        using var response = await client.PostAsJsonAsync("/api/chat", new { message = "Gợi ý laptop" });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ChatResponseDto>();
        Assert.Equal("Laptop Acme", result?.Reply);
    }

    private sealed class RecordingChatService : IChatService
    {
        public Task<ChatResponseDto> ChatAsync(ChatRequestDto request, CancellationToken cancellationToken = default) =>
            Task.FromResult(new ChatResponseDto("Laptop Acme", null));
    }
}
