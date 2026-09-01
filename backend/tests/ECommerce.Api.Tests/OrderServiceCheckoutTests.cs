using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Orders;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using ECommerce.Api.Services.Orders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ECommerce.Api.Tests;

public sealed class OrderServiceCheckoutTests
{
    [Fact]
    public async Task CheckoutSnapshotsServerDataTotalsAndClearsCart()
    {
        await using var f = await Fixture.CreateAsync();
        var result = await f.Service.CheckoutAsync(7, new CheckoutDto { AddressID = 11, PaymentMethod = "COD", Note = "  call first  " });
        Assert.Equal(25m, result.TotalAmount);
        Assert.Equal("PENDING", result.PaymentStatus);
        Assert.Equal("PENDING", result.OrderStatus);
        Assert.Equal("call first", result.Note);
        Assert.Equal([20m, 5m], result.Items.Select(x => x.TotalPrice));
        Assert.Empty(await f.Context.CartItems.ToListAsync());
        Assert.Equal(3, await f.Context.Products.SumAsync(x => x.StockQuantity));
    }

    [Theory]
    [InlineData(0, "COD")]
    [InlineData(11, "CARD")]
    public async Task CheckoutRejectsInvalidRequest(int addressId, string paymentMethod)
    {
        await using var f = await Fixture.CreateAsync();
        await Assert.ThrowsAsync<DomainValidationException>(() => f.Service.CheckoutAsync(7, new CheckoutDto { AddressID = addressId, PaymentMethod = paymentMethod }));
        Assert.Equal(2, await f.Context.CartItems.CountAsync());
        Assert.Empty(await f.Context.Orders.ToListAsync());
    }

    [Fact]
    public async Task CheckoutRejectsForeignAddressEmptyCartAndInsufficientStock()
    {
        await using var f = await Fixture.CreateAsync();
        await Assert.ThrowsAsync<ResourceNotFoundException>(() => f.Service.CheckoutAsync(7, new CheckoutDto { AddressID = 12 }));
        (await f.Context.Products.FindAsync(101))!.StockQuantity = 1;
        await f.Context.SaveChangesAsync();
        await Assert.ThrowsAsync<DomainValidationException>(() => f.Service.CheckoutAsync(7, new CheckoutDto { AddressID = 11 }));
        f.Context.CartItems.RemoveRange(f.Context.CartItems);
        await f.Context.SaveChangesAsync();
        await Assert.ThrowsAsync<DomainValidationException>(() => f.Service.CheckoutAsync(7, new CheckoutDto { AddressID = 11 }));
    }

    private sealed class Fixture : IAsyncDisposable
    {
        public AppDbContext Context { get; }
        public OrderService Service { get; }
        private Fixture(AppDbContext context) { Context = context; Service = new OrderService(context); }
        public static async Task<Fixture> CreateAsync()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString())
                .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning)).Options;
            var db = new AppDbContext(options);
            db.Addresses.AddRange(
                new Address { AddressID = 11, UserID = 7, ReceiverName = "Receiver", ReceiverPhone = "0900", FullAddress = "1 Main" },
                new Address { AddressID = 12, UserID = 8, ReceiverName = "Other", ReceiverPhone = "0901", FullAddress = "2 Main" });
            db.Products.AddRange(Product(101, "A", "Product A", 10m, 2), Product(102, "B", "Product B", 5m, 1));
            db.Carts.Add(new Cart { CartID = 21, UserID = 7 });
            db.CartItems.AddRange(
                new CartItem { CartItemID = 31, CartID = 21, ProductID = 101, Quantity = 2 },
                new CartItem { CartItemID = 32, CartID = 21, ProductID = 102, Quantity = 1 });
            await db.SaveChangesAsync();
            return new Fixture(db);
        }
        private static Product Product(int id, string sku, string name, decimal price, int stock) => new()
        { ProductID = id, CategoryID = 1, BrandID = 1, SKU = sku, ProductName = name, Price = price, StockQuantity = stock, IsActive = true };
        public ValueTask DisposeAsync() => Context.DisposeAsync();
    }
}
