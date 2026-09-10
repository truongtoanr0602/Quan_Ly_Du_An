using ECommerce.Api.DTOs.Profile;

namespace ECommerce.Api.Services.Profile;

public interface IProfileService
{
    Task<ProfileDto> GetProfileAsync(int userId, CancellationToken cancellationToken = default);
    Task<ProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto, CancellationToken cancellationToken = default);
}
