using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Auth;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ECommerce.Api.Services.Auth;

public class AuthService(AppDbContext context, IConfiguration configuration) : IAuthService
{
    public async Task<AuthResponseDto> RegisterAsync(
        RegisterDto registerDto,
        CancellationToken cancellationToken = default)
    {
        if (await context.Users.AnyAsync(u => u.Email == registerDto.Email, cancellationToken))
        {
            throw new DomainConflictException();
        }

        var customerRole = await context.Roles
            .SingleOrDefaultAsync(role => role.RoleName == "Customer", cancellationToken);
        if (customerRole is null)
        {
            throw new DomainValidationException();
        }

        var user = new User
        {
            Email = registerDto.Email,
            FullName = registerDto.FullName,
            Phone = registerDto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            RoleID = customerRole.RoleID,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        await PersistenceBoundary.SaveChangesAsync(context, cancellationToken);

        return CreateAuthResponse(user, customerRole.RoleName);
    }

    public async Task<AuthResponseDto> LoginAsync(
        LoginDto loginDto,
        CancellationToken cancellationToken = default)
    {
        var user = await context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == loginDto.Email, cancellationToken);

        if (user is null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            throw new InvalidCredentialsException();
        }

        return CreateAuthResponse(user, user.Role.RoleName);
    }

    private AuthResponseDto CreateAuthResponse(User user, string roleName)
    {
        return new AuthResponseDto
        {
            Token = GenerateJwtToken(user, roleName),
            User = new UserInfoDto
            {
                Id = user.UserID,
                Email = user.Email,
                FullName = user.FullName,
                Role = roleName
            }
        };
    }

    private string GenerateJwtToken(User user, string roleName)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var secretKey = jwtSettings["Key"];
        if (string.IsNullOrEmpty(secretKey))
        {
            throw new InvalidOperationException("JWT signing configuration is unavailable.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserID.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, roleName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
