using ECommerce.Api.Data;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using ECommerce.Api.Services.Orders;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Tests;

public sealed class OrderHistoryServiceTests
{
    [Fact]
    public async Task ListIsOwnedNewestFirstAndPaged()
    {
        await using var db = CreateContext();
        db.Orders.AddRange(Order(1, 7, new DateTime(2026, 1, 1), 10m), Order(2, 8, new DateTime(2026, 1, 3), 20m), Order(3, 7, new DateTime(2026, 1, 2), 30m));
        await db.SaveChangesAsync();
        var result = await new OrderService(db).ListAsync(7, 1, 1);
        Assert.Equal(2, result.TotalCount);
        Assert.Equal(3, Assert.Single(result.Items).OrderID);
        Assert.Equal(2, result.TotalPages);
    }

    [Theory]
    [InlineData(0, 10)]
    [InlineData(1, 0)]
    [InlineData(1, 101)]
    public async Task ListRejectsInvalidPaging(int page, int size)
    {
        await using var db = CreateContext();
        await Assert.ThrowsAsync<DomainValidationException>(() => new OrderService(db).ListAsync(7, page, size));
    }

    [Fact]
    public async Task DetailReturnsSnapshotsAndHidesForeignOrders()
    {
        await using var db = CreateContext();
        var owned = Order(4, 7, DateTime.UtcNow, 20m);
        owned.OrderDetails.Add(new OrderDetail { OrderDetailID = 9, ProductID = 2, ProductName = "Snapshot", SKU = "SKU", Quantity = 2, UnitPrice = 10m, TotalPrice = 20m });
        db.Orders.AddRange(owned, Order(5, 8, DateTime.UtcNow, 30m));
        await db.SaveChangesAsync();
        var service = new OrderService(db);
        var detail = await service.GetAsync(7, 4);
        Assert.Equal("Old address", detail.ShippingAddress);
        Assert.Equal("Snapshot", Assert.Single(detail.Items).ProductName);
        await Assert.ThrowsAsync<ResourceNotFoundException>(() => service.GetAsync(7, 5));
        await Assert.ThrowsAsync<ResourceNotFoundException>(() => service.GetAsync(7, 99));
    }

    private static AppDbContext CreateContext() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static Order Order(long id, int userId, DateTime created, decimal total) => new()
    {
        OrderID = id, UserID = userId, ReceiverName = "Receiver", ReceiverPhone = "0900",
        ShippingAddress = "Old address", SubTotal = total, ShippingFee = 0, TotalAmount = total,
        PaymentMethod = "COD", PaymentStatus = "PENDING", OrderStatus = "PENDING", CreatedAt = created
    };
}
