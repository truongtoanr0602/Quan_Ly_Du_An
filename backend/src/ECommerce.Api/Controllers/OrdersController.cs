using ECommerce.Api.DTOs.Orders;
using ECommerce.Api.Helpers;
using ECommerce.Api.Services.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    // Customer: Create order from cart
    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderDto dto, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var order = await _orderService.CreateOrderAsync(userId, dto, cancellationToken);
        return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, order);
    }

    // Customer: Get my orders
    [HttpGet]
    public async Task<IActionResult> GetMyOrders(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var orders = await _orderService.GetUserOrdersAsync(userId, cancellationToken);
        return Ok(orders);
    }

    // Customer: Get order by ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(long id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var order = await _orderService.GetOrderByIdAsync(userId, id, cancellationToken);
        return Ok(order);
    }

    // Customer US-16: Cancel order
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(long id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var order = await _orderService.CancelOrderAsync(userId, id, cancellationToken);
        return Ok(order);
    }

    // Admin US-5: Update order status
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrderStatus(long id, UpdateOrderStatusDto dto, CancellationToken cancellationToken)
    {
        var adminUserId = User.GetUserId();
        var order = await _orderService.UpdateOrderStatusAsync(id, adminUserId, dto, cancellationToken);
        return Ok(order);
    }

    // Admin US-1: Get all orders (paginated)
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _orderService.GetAllOrdersAsync(pageNumber, pageSize, status, cancellationToken);
        return Ok(result);
    }

    // Admin: Get any order by ID
    [HttpGet("admin/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOrderAdmin(long id, CancellationToken cancellationToken)
    {
        var order = await _orderService.GetOrderByIdAdminAsync(id, cancellationToken);
        return Ok(order);
    }
}
