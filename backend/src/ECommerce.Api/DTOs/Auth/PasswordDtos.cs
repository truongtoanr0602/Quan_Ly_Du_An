using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Auth;

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = null!;

    [Required]
    [MinLength(6, ErrorMessage = "New password must be at least 6 characters.")]
    public string NewPassword { get; set; } = null!;
}

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}

public class ResetPasswordDto
{
    [Required]
    public string Token { get; set; } = null!;

    [Required]
    [MinLength(6, ErrorMessage = "New password must be at least 6 characters.")]
    public string NewPassword { get; set; } = null!;
}
