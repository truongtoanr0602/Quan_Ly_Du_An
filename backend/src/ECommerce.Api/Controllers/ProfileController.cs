using ECommerce.Api.DTOs.Profile;
using ECommerce.Api.Helpers;
using ECommerce.Api.Services.Profile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var profile = await _profileService.GetProfileAsync(userId, cancellationToken);
        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var profile = await _profileService.UpdateProfileAsync(userId, dto, cancellationToken);
        return Ok(profile);
    }
}
