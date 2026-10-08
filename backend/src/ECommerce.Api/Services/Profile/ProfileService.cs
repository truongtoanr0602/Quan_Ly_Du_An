using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Profile;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Profile;

public sealed class ProfileService(AppDbContext context) : IProfileService
{
    public async Task<ProfileDto> GetAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await context.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(candidate => candidate.UserID == userId, cancellationToken)
            ?? throw new ResourceNotFoundException();

        return ToDto(user);
    }

    public async Task<ProfileDto> UpdateAsync(
        int userId,
        UpdateProfileDto dto,
        CancellationToken cancellationToken = default)
    {
        var user = await context.Users
            .SingleOrDefaultAsync(candidate => candidate.UserID == userId, cancellationToken)
            ?? throw new ResourceNotFoundException();

        var fullName = dto.FullName.Trim();
        if (fullName.Length == 0)
        {
            throw new DomainValidationException();
        }

        user.FullName = fullName;
        user.Phone = NormalizeOptional(dto.Phone);
        user.AvatarURL = NormalizeOptional(dto.AvatarURL);

        await context.SaveChangesAsync(cancellationToken);
        return ToDto(user);
    }

    private static string? NormalizeOptional(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrEmpty(normalized) ? null : normalized;
    }

    private static ProfileDto ToDto(User user) =>
        new(user.UserID, user.Email, user.FullName, user.Phone, user.AvatarURL);
}
