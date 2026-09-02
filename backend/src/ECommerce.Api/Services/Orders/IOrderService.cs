using ECommerce.Api.DTOs;
using ECommerce.Api.DTOs.Orders;

namespace ECommerce.Api.Services.Orders;

public interface IOrderService
{
    Task<OrderDetailDto> CheckoutAsync(int userId, CheckoutDto dto, CancellationToken ct = default);
    Task<PagedResult<OrderSummaryDto>> ListAsync(int userId, int pageNumber, int pageSize, CancellationToken ct = default);
    Task<OrderDetailDto> GetAsync(int userId, long orderId, CancellationToken ct = default);
}
