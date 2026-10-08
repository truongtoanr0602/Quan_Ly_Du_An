using System.Net;
using System.Net.Http.Json;
using ECommerce.Api.DTOs;
using ECommerce.Api.DTOs.Orders;
using ECommerce.Api.Services.Orders;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Tests;

public sealed class OrdersControllerTests
{
    [Fact]
    public async Task CheckoutIsCustomerOnlyAndUsesJwtIdentity()
    {
        var service = new RecordingOrderService();
        using var factory = new TestApiFactory(configureTestServices: services =>
        {
            services.AddSingleton(service);
            services.AddSingleton<IOrderService>(service);
        });
        Assert.Equal(HttpStatusCode.Unauthorized, (await factory.CreateClient().PostAsJsonAsync("/api/orders", new CheckoutDto { AddressID = 1 })).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await factory.CreateClientWithRole("Admin", 1).PostAsJsonAsync("/api/orders", new CheckoutDto { AddressID = 1 })).StatusCode);
        using var response = await factory.CreateClientWithRole("Customer", 42).PostAsJsonAsync("/api/orders", new CheckoutDto { AddressID = 3 });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal(42, service.UserId);
    }

    private sealed class RecordingOrderService : IOrderService
    {
        public int UserId { get; private set; }
        public Task<OrderDetailDto> CheckoutAsync(int userId, CheckoutDto dto, CancellationToken ct = default)
        {
            UserId = userId;
            return Task.FromResult(new OrderDetailDto(99, userId, "R", "P", null, null, null, "A", 1m, 0m, 1m, "COD", "PENDING", "PENDING", null, DateTime.UtcNow, []));
        }
        public Task<PagedResult<OrderSummaryDto>> ListAsync(int userId, int pageNumber, int pageSize, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<OrderDetailDto> GetAsync(int userId, long orderId, CancellationToken ct = default) => throw new NotImplementedException();
    }
}
