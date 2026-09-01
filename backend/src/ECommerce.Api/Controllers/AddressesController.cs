using ECommerce.Api.DTOs.Addresses;
using ECommerce.Api.Extensions;
using ECommerce.Api.Services.Addresses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Authorize(Roles = "Customer")]
[Route("api/addresses")]
public sealed class AddressesController(IAddressService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AddressDto>>> List(CancellationToken ct) =>
        Ok(await service.ListAsync(User.GetRequiredUserId(), ct));

    [HttpPost]
    public async Task<ActionResult<AddressDto>> Create(AddressWriteDto dto, CancellationToken ct)
    {
        var result = await service.CreateAsync(User.GetRequiredUserId(), dto, ct);
        return CreatedAtAction(nameof(List), result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AddressDto>> Update(int id, AddressWriteDto dto, CancellationToken ct) =>
        Ok(await service.UpdateAsync(User.GetRequiredUserId(), id, dto, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await service.DeleteAsync(User.GetRequiredUserId(), id, ct);
        return NoContent();
    }
}
