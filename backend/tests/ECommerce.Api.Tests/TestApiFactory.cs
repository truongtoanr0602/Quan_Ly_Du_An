using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace ECommerce.Api.Tests;

public sealed class TestApiFactory(
    bool withJwtKey = true,
    Action<IServiceCollection>? configureTestServices = null) : WebApplicationFactory<Program>
{
    public const string TestJwtKey = "test-signing-key-that-is-at-least-32-bytes-long";
    private const string TestConnectionString = "Server=(localdb)\\MSSQLLocalDB;Database=ECommerce_Test;Trusted_Connection=True;TrustServerCertificate=True";
    private const string TestIssuer = "ECommerce.Api.Tests";
    private const string TestAudience = "ECommerce.Frontend.Tests";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:ECommerce", TestConnectionString);
        builder.UseSetting("Jwt:Issuer", TestIssuer);
        builder.UseSetting("Jwt:Audience", TestAudience);

        if (withJwtKey)
        {
            builder.UseSetting("Jwt:Key", TestJwtKey);
        }
        else
        {
            builder.UseSetting("Jwt:Key", string.Empty);
        }

        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            var values = new Dictionary<string, string?>
            {
                ["ConnectionStrings:ECommerce"] = TestConnectionString,
                ["Jwt:Issuer"] = TestIssuer,
                ["Jwt:Audience"] = TestAudience
            };

            if (withJwtKey)
            {
                values["Jwt:Key"] = TestJwtKey;
            }
            else
            {
                values["Jwt:Key"] = string.Empty;
            }

            configuration.AddInMemoryCollection(values);
        });

        builder.ConfigureTestServices(services => configureTestServices?.Invoke(services));
    }

    public HttpClient CreateClientWithRole(string? role)
    {
        var client = CreateClient();

        if (role is null)
        {
            return client;
        }

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestJwtKey)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: TestIssuer,
            audience: TestAudience,
            claims: [new Claim(ClaimTypes.Role, role)],
            expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: credentials);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            new JwtSecurityTokenHandler().WriteToken(token));

        return client;
    }
}
