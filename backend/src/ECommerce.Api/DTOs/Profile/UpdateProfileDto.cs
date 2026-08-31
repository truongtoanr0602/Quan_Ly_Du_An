using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Profile;

public sealed class UpdateProfileDto
{
    [Required, StringLength(100)]
    public string FullName { get; init; } = string.Empty;

    [StringLength(20)]
    public string? Phone { get; init; }

    [StringLength(500)]
    public string? AvatarURL { get; init; }
}
