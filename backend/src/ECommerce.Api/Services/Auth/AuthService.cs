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

    public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await context.Users.FindAsync(userId)
            ?? throw new Exception("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new Exception("Current password is incorrect.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();
    }

    public async Task<string> RequestPasswordResetAsync(ForgotPasswordDto dto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
        {
            // Không tiết lộ email có tồn tại hay không
            return "If this email exists, a reset link has been sent.";
        }

        // Tạo token
        var token = Guid.NewGuid().ToString("N");
        context.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserID = user.UserID,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        // MVP: trả token qua API (không gửi email)
        return token;
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        var resetToken = await context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == dto.Token && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow)
            ?? throw new Exception("Invalid or expired reset token.");

        resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        resetToken.User.UpdatedAt = DateTime.UtcNow;
        resetToken.UsedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
    }
}

