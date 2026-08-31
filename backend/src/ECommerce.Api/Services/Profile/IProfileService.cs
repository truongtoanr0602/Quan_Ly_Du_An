using ECommerce.Api.DTOs.Profile;

namespace ECommerce.Api.Services.Profile;

public interface IProfileService
{
    Task<ProfileDto> GetAsync(int userId, CancellationToken cancellationToken = default);
    Task<ProfileDto> UpdateAsync(int userId, UpdateProfileDto dto, CancellationToken cancellationToken = default);
}
