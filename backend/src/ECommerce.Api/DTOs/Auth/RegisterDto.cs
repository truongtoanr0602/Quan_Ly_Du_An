using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Auth;

public class RegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; set; } = null!;

    [Required]
    public string FullName { get; set; } = null!;

    public string? Phone { get; set; }
}
