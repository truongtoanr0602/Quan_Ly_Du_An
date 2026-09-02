using System.Net;
using System.Net.Http.Json;
using ECommerce.Api.DTOs.Cart;
using ECommerce.Api.Services.Cart;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Tests;

public sealed class CartControllerTests
{
    [Fact]
    public async Task AnonymousAndAdminCannotAccessCustomerCart()
    {
        using var factory = CreateFactory(new RecordingCartService());
        using var anonymous = factory.CreateClient();
        using var admin = factory.CreateClientWithRole("Admin", 1);

        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/cart")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await admin.GetAsync("/api/cart")).StatusCode);
    }

    [Fact]
    public async Task CustomerIdentityComesFromJwtForEveryMutation()
    {
        var service = new RecordingCartService();
        using var factory = CreateFactory(service);
        using var client = factory.CreateClientWithRole("Customer", 42);

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/cart")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/cart/items", new AddCartItemDto { ProductID = 3, Quantity = 2 })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PutAsJsonAsync("/api/cart/items/3", new UpdateCartItemDto { Quantity = 4 })).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/api/cart/items/3")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/api/cart")).StatusCode);
        Assert.All(service.UserIds, id => Assert.Equal(42, id));
    }

    private static TestApiFactory CreateFactory(ICartService service) => new(
        configureTestServices: services =>
        {
            services.AddSingleton(service);
            services.AddSingleton<ICartService>(service);
        });

    private sealed class RecordingCartService : ICartService
    {
        private static readonly CartDto Empty = new([], 0, 0m);
        public List<int> UserIds { get; } = [];

        public Task<CartDto> GetAsync(int userId, CancellationToken ct = default) => Record(userId);
        public Task<CartDto> AddAsync(int userId, AddCartItemDto dto, CancellationToken ct = default) => Record(userId);
        public Task<CartDto> UpdateAsync(int userId, int productId, UpdateCartItemDto dto, CancellationToken ct = default) => Record(userId);
        public Task RemoveAsync(int userId, int productId, CancellationToken ct = default) { UserIds.Add(userId); return Task.CompletedTask; }
        public Task ClearAsync(int userId, CancellationToken ct = default) { UserIds.Add(userId); return Task.CompletedTask; }

        private Task<CartDto> Record(int userId)
        {
            UserIds.Add(userId);
            return Task.FromResult(Empty);
        }
    }
}
