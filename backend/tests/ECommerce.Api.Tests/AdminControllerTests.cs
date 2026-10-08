using System.Net;
using System.Net.Http.Json;
using ECommerce.Api.DTOs.Admin;
using ECommerce.Api.Services.Admin;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Tests;

public sealed class AdminControllerTests
{
    [Fact]
    public async Task AdminRoutesRequireAdminRoleAndUseJwtIdentityForUpdates()
    {
        var service = new RecordingAdminService();
        using var factory = new TestApiFactory(configureTestServices: services =>
            services.AddSingleton<IAdminService>(service));
        using var anonymous = factory.CreateClient();
        using var customer = factory.CreateClientWithRole("Customer", 2);
        using var admin = factory.CreateClientWithRole("Admin", 1);

        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/admin/users")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await customer.GetAsync("/api/admin/orders")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/admin/users")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/admin/orders")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/admin/orders/19")).StatusCode);
        using var response = await admin.PutAsJsonAsync("/api/admin/orders/19/status", new { newStatus = "CONFIRMED" });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(1, service.UpdatedBy);
    }

    private sealed class RecordingAdminService : IAdminService
    {
        public int UpdatedBy { get; private set; }
        public Task<PagedUserResult> GetUsersAsync(int pageNumber, int pageSize, string? keyword, CancellationToken cancellationToken = default) =>
            Task.FromResult(new PagedUserResult());
        public Task<PagedAdminOrderResult> GetOrdersAsync(int pageNumber, int pageSize, string? status, CancellationToken cancellationToken = default) =>
            Task.FromResult(new PagedAdminOrderResult());
        public Task<AdminOrderDto> GetOrderAsync(long orderId, CancellationToken cancellationToken = default) =>
            Task.FromResult(new AdminOrderDto { OrderId = orderId });
        public Task<AdminOrderDto> UpdateOrderStatusAsync(long orderId, int adminUserId, string newStatus, string? note, CancellationToken cancellationToken = default)
        {
            UpdatedBy = adminUserId;
            return Task.FromResult(new AdminOrderDto { OrderId = orderId, OrderStatus = newStatus });
        }
    }
}
