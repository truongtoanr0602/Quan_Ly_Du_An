using ECommerce.Api.DTOs.Admin;

namespace ECommerce.Api.Services.Admin;

public interface IAdminService
{
    Task<PagedUserResult> GetUsersAsync(int pageNumber, int pageSize, string? keyword, CancellationToken cancellationToken = default);
    Task<PagedAdminOrderResult> GetOrdersAsync(int pageNumber, int pageSize, string? status, CancellationToken cancellationToken = default);
    Task<AdminOrderDto> GetOrderAsync(long orderId, CancellationToken cancellationToken = default);
    Task<AdminOrderDto> UpdateOrderStatusAsync(long orderId, int adminUserId, string newStatus, string? note, CancellationToken cancellationToken = default);
}

public class PagedUserResult
{
    public List<UserListDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}
