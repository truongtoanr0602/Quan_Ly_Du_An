using ECommerce.Api.Extensions;
using ECommerce.Api.DTOs.Orders;
using ECommerce.Api.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    // US-1: Get all users (paginated)
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? keyword = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _adminService.GetUsersAsync(pageNumber, pageSize, keyword, cancellationToken);
        return Ok(result);
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default) =>
        Ok(await _adminService.GetOrdersAsync(pageNumber, pageSize, status, cancellationToken));

    [HttpGet("orders/{orderId:long}")]
    public async Task<IActionResult> GetOrder(long orderId, CancellationToken cancellationToken) =>
        Ok(await _adminService.GetOrderAsync(orderId, cancellationToken));

    [HttpPut("orders/{orderId:long}/status")]
    public async Task<IActionResult> UpdateOrderStatus(
        long orderId,
        UpdateOrderStatusDto dto,
        CancellationToken cancellationToken) =>
        Ok(await _adminService.UpdateOrderStatusAsync(
            orderId, User.GetRequiredUserId(), dto.NewStatus, dto.Note, cancellationToken));
}

