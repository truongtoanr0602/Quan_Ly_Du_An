using ECommerce.Api.DTOs.Carts;
using ECommerce.Api.Helpers;
using ECommerce.Api.Services.Carts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CartsController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartsController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var cart = await _cartService.GetCartAsync(userId, cancellationToken);
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemDto dto, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var cart = await _cartService.AddItemAsync(userId, dto, cancellationToken);
        return Ok(cart);
    }

    [HttpPut("items/{cartItemId}")]
    public async Task<IActionResult> UpdateItemQuantity(long cartItemId, UpdateCartItemDto dto, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var cart = await _cartService.UpdateItemQuantityAsync(userId, cartItemId, dto, cancellationToken);
        return Ok(cart);
    }

    [HttpDelete("items/{cartItemId}")]
    public async Task<IActionResult> RemoveItem(long cartItemId, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        await _cartService.RemoveItemAsync(userId, cartItemId, cancellationToken);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        await _cartService.ClearCartAsync(userId, cancellationToken);
        return NoContent();
    }
}
