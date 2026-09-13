using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Auth;
using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ECommerce.Api.Services.Auth;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        // 1. Kiểm tra Email tồn tại chưa
        if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
        {
            throw new Exception("Email is already registered."); // Hoặc ném custom exception TBD
        }

        // 2. Mặc định là role Customer. Nếu email chứa "admin", cấp quyền Admin (dành cho Dev/Testing)
        var roleName = registerDto.Email.ToLower().Contains("admin") ? "Admin" : "Customer";
        var assignedRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
        if (assignedRole == null) 
            throw new Exception($"Role {roleName} not found in database.");

        // 3. Tạo User
        var user = new User
        {
            Email = registerDto.Email,
            FullName = registerDto.FullName,
            Phone = registerDto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            RoleID = assignedRole.RoleID,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // 4. Generate Token & Trả về
        var token = GenerateJwtToken(user, assignedRole.RoleName);

        return new AuthResponseDto
        {
            Token = token,
            User = new UserInfoDto
            {
                Id = user.UserID,
                Email = user.Email,
                FullName = user.FullName,
                Role = assignedRole.RoleName
            }
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user == null || !user.IsActive)
        {
            throw new Exception("Invalid email or password.");
        }

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            throw new Exception("Invalid email or password.");
        }

        var token = GenerateJwtToken(user, user.Role.RoleName);

        return new AuthResponseDto
        {
            Token = token,
            User = new UserInfoDto
            {
                Id = user.UserID,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.RoleName
            }
        };
    }

    private string GenerateJwtToken(User user, string roleName)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKey = jwtSettings["Key"];
        if (string.IsNullOrEmpty(secretKey))
            throw new Exception("JWT Key is not configured.");

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
            expires: DateTime.UtcNow.AddDays(7), // Hạn 7 ngày cho dev/test ổn định
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new Exception("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new Exception("Current password is incorrect.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task<string> RequestPasswordResetAsync(ForgotPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
        {
            // Không tiết lộ email có tồn tại hay không
            return "If this email exists, a reset link has been sent.";
        }

        // Tạo token
        var token = Guid.NewGuid().ToString("N");
        _context.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserID = user.UserID,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        // MVP: trả token qua API (không gửi email)
        return token;
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        var resetToken = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == dto.Token && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow)
            ?? throw new Exception("Invalid or expired reset token.");

        resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        resetToken.User.UpdatedAt = DateTime.UtcNow;
        resetToken.UsedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}

