using System.Net;

namespace ECommerce.Api.Tests;

public sealed class ApiEndpointTests
{
    [Fact]
    public async Task HealthEndpointIsAvailableInTesting()
    {
        using var factory = new TestApiFactory();
        using var client = factory.CreateClient();
        using var response = await client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpointsReturnUnauthorizedWithoutToken()
    {
        using var factory = new TestApiFactory();
        using var client = factory.CreateClient();

        using var cartResponse = await client.GetAsync("/api/cart");
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
