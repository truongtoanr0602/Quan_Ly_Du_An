namespace ECommerce.Api.DTOs.Profile;

public class ProfileDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
