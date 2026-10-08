using ECommerce.Api.DTOs.Auth;
using ECommerce.Api.Helpers;
using ECommerce.Api.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto, CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(dto, cancellationToken);
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto, CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(dto, cancellationToken);
        return Created("/api/auth/register", result);
    }

    // US-11: Change password
    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        try
        {
            var userId = User.GetUserId();
            await authService.ChangePasswordAsync(userId, dto);
            return Ok(new { Message = "Password changed successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    // US-10: Forgot password (request reset token)
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        try
        {
            var token = await authService.RequestPasswordResetAsync(dto);
            return Ok(new { Message = "If this email exists, a reset link has been sent.", ResetToken = token });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    // US-10: Reset password with token
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        try
        {
            await authService.ResetPasswordAsync(dto);
            return Ok(new { Message = "Password has been reset successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}

