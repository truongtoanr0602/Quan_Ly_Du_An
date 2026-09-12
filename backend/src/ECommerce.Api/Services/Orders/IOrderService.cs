using ECommerce.Api.DTOs.Orders;

namespace ECommerce.Api.Services.Orders;

public interface IOrderService
{
    // Sprint 2: Customer ordering
    Task<OrderDto> CreateOrderAsync(int userId, CreateOrderDto dto, CancellationToken cancellationToken = default);
    Task<List<OrderDto>> GetUserOrdersAsync(int userId, CancellationToken cancellationToken = default);
    Task<OrderDto> GetOrderByIdAsync(int userId, long orderId, CancellationToken cancellationToken = default);

    // Sprint 3 US-16: Cancel order (Customer)
    Task<OrderDto> CancelOrderAsync(int userId, long orderId, CancellationToken cancellationToken = default);

    // Sprint 3 US-5: Update order status (Admin)
    Task<OrderDto> UpdateOrderStatusAsync(long orderId, int adminUserId, UpdateOrderStatusDto dto, CancellationToken cancellationToken = default);

    // Sprint 3 US-1: Admin view all orders
    Task<PagedOrderResult> GetAllOrdersAsync(int pageNumber, int pageSize, string? status, CancellationToken cancellationToken = default);
    Task<OrderDto> GetOrderByIdAdminAsync(long orderId, CancellationToken cancellationToken = default);
}

public class PagedOrderResult
{
    public List<OrderDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}
