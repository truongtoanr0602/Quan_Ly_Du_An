using ECommerce.Api.DTOs.Addresses;
using ECommerce.Api.Helpers;
using ECommerce.Api.Services.Addresses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly IAddressService _addressService;

    public AddressesController(IAddressService addressService)
    {
        _addressService = addressService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAddresses(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var addresses = await _addressService.GetUserAddressesAsync(userId, cancellationToken);
        return Ok(addresses);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAddress(int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var address = await _addressService.GetByIdAsync(userId, id, cancellationToken);
        return Ok(address);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAddress(AddressCreateDto dto, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var address = await _addressService.CreateAsync(userId, dto, cancellationToken);
        return CreatedAtAction(nameof(GetAddress), new { id = address.AddressId }, address);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAddress(int id, AddressUpdateDto dto, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var address = await _addressService.UpdateAsync(userId, id, dto, cancellationToken);
        return Ok(address);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        await _addressService.DeleteAsync(userId, id, cancellationToken);
        return NoContent();
    }
}
