using System.Net;

namespace ECommerce.Api.Tests;

public sealed class StartupConfigurationTests
{
    [Fact]
    public void CreateClientWithoutJwtKeyFailsWithoutEchoingConfiguration()
    {
        using var factory = new TestApiFactory(withJwtKey: false);

        var exception = Assert.ThrowsAny<Exception>(() => factory.CreateClient());

        Assert.DoesNotContain("test-signing-key", exception.ToString(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void CreateClientWithoutJwtKeyFailsWhenEnvironmentProvidesJwtKey()
    {
        var originalJwtKey = Environment.GetEnvironmentVariable("Jwt__Key");

        try
        {
            Environment.SetEnvironmentVariable("Jwt__Key", TestApiFactory.TestJwtKey);
            using var factory = new TestApiFactory(withJwtKey: false);

            var exception = Assert.ThrowsAny<Exception>(() => factory.CreateClient());

            Assert.DoesNotContain("test-signing-key", exception.ToString(), StringComparison.OrdinalIgnoreCase);
        }
        finally
        {
            Environment.SetEnvironmentVariable("Jwt__Key", originalJwtKey);
        }
    }

    [Fact]
    public async Task HealthEndpointStartsWhenTestConfigurationSuppliesJwtKey()
    {
        using var factory = new TestApiFactory();
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
