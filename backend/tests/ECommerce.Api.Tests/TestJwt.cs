using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace ECommerce.Api.Tests;

/// <summary>
/// Test-only JWT material. This is not a production secret; the running application reads
/// `Jwt:Key` from User Secrets or environment variables.
/// </summary>
internal static class TestJwt
{
    public const string SigningKey = "ecommerce-tests-signing-key-please-do-not-use-in-any-real-environment";

    public const string Issuer = "ECommerce.Api";

    public const string Audience = "ECommerce.Client";

    public static string CreateToken(string role, int userId = 1)
    {
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = Issuer,
            Audience = Audience,
            Expires = DateTime.UtcNow.AddMinutes(30),
            Subject = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role)
            ]),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
                SecurityAlgorithms.HmacSha256)
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }
}
