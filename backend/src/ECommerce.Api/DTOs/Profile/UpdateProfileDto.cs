using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Profile;

public class UpdateProfileDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = null!;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(500)]
    public string? AvatarUrl { get; set; }
}
