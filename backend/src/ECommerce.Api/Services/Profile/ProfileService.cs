using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Profile;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Profile;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _context;

    public ProfileService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ProfileDto> GetProfileAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserID == userId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        return new ProfileDto
        {
            UserId = user.UserID,
            Email = user.Email,
            FullName = user.FullName,
            Phone = user.Phone,
            AvatarUrl = user.AvatarURL,
            Role = user.Role.RoleName,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<ProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserID == userId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        user.FullName = dto.FullName;
        user.Phone = dto.Phone;
        user.AvatarURL = dto.AvatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new ProfileDto
        {
            UserId = user.UserID,
            Email = user.Email,
            FullName = user.FullName,
            Phone = user.Phone,
            AvatarUrl = user.AvatarURL,
            Role = user.Role.RoleName,
            CreatedAt = user.CreatedAt
        };
    }
}
