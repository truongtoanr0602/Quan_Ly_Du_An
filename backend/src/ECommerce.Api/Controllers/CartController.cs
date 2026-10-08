using ECommerce.Api.DTOs.Cart;
using ECommerce.Api.Extensions;
using ECommerce.Api.Services.Cart;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Authorize(Roles = "Customer")]
[Route("api/cart")]
public sealed class CartController(ICartService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CartDto>> Get(CancellationToken ct) =>
        Ok(await service.GetAsync(User.GetRequiredUserId(), ct));

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> Add(AddCartItemDto dto, CancellationToken ct) =>
        Ok(await service.AddAsync(User.GetRequiredUserId(), dto, ct));

    [HttpPut("items/{productId:int}")]
    public async Task<ActionResult<CartDto>> Update(int productId, UpdateCartItemDto dto, CancellationToken ct) =>
        Ok(await service.UpdateAsync(User.GetRequiredUserId(), productId, dto, ct));

    [HttpDelete("items/{productId:int}")]
    public async Task<IActionResult> Remove(int productId, CancellationToken ct)
    {
        await service.RemoveAsync(User.GetRequiredUserId(), productId, ct);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> Clear(CancellationToken ct)
    {
        await service.ClearAsync(User.GetRequiredUserId(), ct);
        return NoContent();
    }
}
