using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Cart;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using ECommerce.Api.Services.Cart;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Tests;

public sealed class CartServiceTests
{
    [Fact]
    public async Task EmptyCartHasZeroTotals()
    {
        await using var fixture = CartFixture.Create();
        var cart = await fixture.Service.GetAsync(7);
        Assert.Empty(cart.Items);
        Assert.Equal(0, cart.TotalItems);
        Assert.Equal(0m, cart.TotalAmount);
    }

    [Fact]
    public async Task AddMergesProductAndUsesServerPrice()
    {
        await using var fixture = CartFixture.Create();
        var product = await fixture.AddProductAsync(price: 12.50m, stock: 5);

        await fixture.Service.AddAsync(7, new AddCartItemDto { ProductID = product.ProductID, Quantity = 2 });
        var cart = await fixture.Service.AddAsync(7, new AddCartItemDto { ProductID = product.ProductID, Quantity = 1 });

        var item = Assert.Single(cart.Items);
        Assert.Equal(3, item.Quantity);
        Assert.Equal(12.50m, item.UnitPrice);
        Assert.Equal(37.50m, item.LineTotal);
        Assert.Equal(3, cart.TotalItems);
        Assert.Equal(37.50m, cart.TotalAmount);
    }

    [Fact]
    public async Task UpdateReplacesQuantityAndRemoveKeepsOtherCustomersIsolated()
    {
        await using var fixture = CartFixture.Create();
        var product = await fixture.AddProductAsync(stock: 5);
        await fixture.Service.AddAsync(7, new AddCartItemDto { ProductID = product.ProductID, Quantity = 1 });
        await fixture.Service.AddAsync(8, new AddCartItemDto { ProductID = product.ProductID, Quantity = 1 });

        var updated = await fixture.Service.UpdateAsync(7, product.ProductID, new UpdateCartItemDto { Quantity = 4 });
        Assert.Equal(4, Assert.Single(updated.Items).Quantity);

        await fixture.Service.RemoveAsync(7, product.ProductID);
        Assert.Empty((await fixture.Service.GetAsync(7)).Items);
        Assert.Single((await fixture.Service.GetAsync(8)).Items);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(6)]
    public async Task AddRejectsInvalidOrUnavailableQuantity(int quantity)
    {
        await using var fixture = CartFixture.Create();
        var product = await fixture.AddProductAsync(stock: 5);

        await Assert.ThrowsAsync<DomainValidationException>(() =>
            fixture.Service.AddAsync(7, new AddCartItemDto { ProductID = product.ProductID, Quantity = quantity }));
    }

    [Fact]
    public async Task AddRejectsInactiveProductAndClearRemovesAllItems()
    {
        await using var fixture = CartFixture.Create();
        var inactive = await fixture.AddProductAsync(active: false);
        await Assert.ThrowsAsync<ResourceNotFoundException>(() =>
            fixture.Service.AddAsync(7, new AddCartItemDto { ProductID = inactive.ProductID, Quantity = 1 }));

        var active = await fixture.AddProductAsync();
        await fixture.Service.AddAsync(7, new AddCartItemDto { ProductID = active.ProductID, Quantity = 1 });
        await fixture.Service.ClearAsync(7);
        Assert.Empty((await fixture.Service.GetAsync(7)).Items);
    }

    private sealed class CartFixture : IAsyncDisposable
    {
        public AppDbContext Context { get; }
        public CartService Service { get; }

        private CartFixture(AppDbContext context)
        {
            Context = context;
            Service = new CartService(context);
        }

        public static CartFixture Create()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
            return new CartFixture(new AppDbContext(options));
        }

        public async Task<Product> AddProductAsync(decimal price = 10m, int stock = 10, bool active = true)
        {
            var product = new Product
            {
                CategoryID = 1,
                BrandID = 1,
                SKU = Guid.NewGuid().ToString("N"),
                ProductName = "Cart product",
                Price = price,
                StockQuantity = stock,
                IsActive = active,
                CreatedAt = DateTime.UtcNow
            };
            Context.Products.Add(product);
            await Context.SaveChangesAsync();
            return product;
        }

        public ValueTask DisposeAsync() => Context.DisposeAsync();
    }
}
