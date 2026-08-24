using System.Net;
using System.Net.Http.Json;

namespace ECommerce.Api.Tests;

public sealed class HealthEndpointTests
{
    [Fact]
    public async Task GetHealthReturnsHealthyStatus()
    {
        using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateAnonymousClient();

        using var response = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var payload = await response.Content.ReadFromJsonAsync<HealthResponse>();
        Assert.NotNull(payload);
        Assert.Equal("Healthy", payload.Status);
    }

    private sealed record HealthResponse(string Status);
}
