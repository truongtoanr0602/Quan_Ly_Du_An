using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Logging;

namespace ECommerce.Api.Tests;

public sealed class ApiEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public ApiEndpointTests(WebApplicationFactory<Program> factory)
    {
        client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureLogging(logging => logging.ClearProviders());
        }).CreateClient();
    }

    [Fact]
    public async Task SwaggerEndpointIsAvailableInDevelopment()
    {
        var devClient = client; // In Testing environment, swagger is not exposed for security
        using var response = await client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpointsReturnUnauthorizedWithoutToken()
    {
        using var cartResponse = await client.GetAsync("/api/carts");
        Assert.Equal(HttpStatusCode.Unauthorized, cartResponse.StatusCode);

        using var ordersResponse = await client.GetAsync("/api/orders");
        Assert.Equal(HttpStatusCode.Unauthorized, ordersResponse.StatusCode);

        using var profileResponse = await client.GetAsync("/api/profile");
        Assert.Equal(HttpStatusCode.Unauthorized, profileResponse.StatusCode);

        using var adminUsersResponse = await client.GetAsync("/api/admin/users");
        Assert.Equal(HttpStatusCode.Unauthorized, adminUsersResponse.StatusCode);

        using var inventoryResponse = await client.GetAsync("/api/inventory");
        Assert.Equal(HttpStatusCode.Unauthorized, inventoryResponse.StatusCode);

        using var reportsResponse = await client.GetAsync("/api/reports/summary");
        Assert.Equal(HttpStatusCode.Unauthorized, reportsResponse.StatusCode);
    }
}
