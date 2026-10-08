using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Inventory;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using ECommerce.Api.Services.Admin;
using ECommerce.Api.Services.Inventory;
using ECommerce.Api.Services.Reports;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Tests;

public sealed class AdminPortalServiceTests
{
    [Fact]
    public async Task AdminOrderListAndStatusPreserveMockQrPaymentState()
    {
        await using var db = CreateContext();
        SeedUsersAndOrder(db);
        await db.SaveChangesAsync();
        var service = new AdminService(db);

        var result = await service.GetOrdersAsync(1, 10, "PENDING");
        Assert.Single(result.Items);
        Assert.Equal("Buyer", result.Items[0].CustomerName);

        var completed = await service.UpdateOrderStatusAsync(19, 1, "COMPLETED", "Delivered");
        Assert.Equal("COMPLETED", completed.OrderStatus);
        Assert.Equal("PENDING", completed.PaymentStatus);
        Assert.Single(await db.OrderStatusHistories.ToListAsync());
        await Assert.ThrowsAsync<DomainConflictException>(() =>
            service.UpdateOrderStatusAsync(19, 1, "PENDING", null));
    }

    [Fact]
    public async Task UserListAndInventoryActionsReturnSavedData()
    {
        await using var db = CreateContext();
        SeedUsersAndOrder(db);
        db.Categories.Add(new Category { CategoryID = 3, CategoryName = "Laptops", IsActive = true });
        db.Brands.Add(new Brand { BrandID = 4, BrandName = "Acme", IsActive = true });
        db.Products.Add(new Product
        {
            ProductID = 5, CategoryID = 3, BrandID = 4, ProductName = "Laptop", SKU = "LAP-5",
            Price = 100m, StockQuantity = 3, IsActive = true
        });
        await db.SaveChangesAsync();

        var users = await new AdminService(db).GetUsersAsync(1, 10, "Buyer");
        Assert.Single(users.Items);
        Assert.Equal(1, users.Items[0].OrderCount);

        var inventory = new InventoryService(db);
        Assert.Single(await inventory.GetInventoryListAsync("LAP-5"));
        var updated = await inventory.UpdateStockAsync(5, 1, new UpdateStockDto
        {
            TransactionType = "Import", Quantity = 2
        });
        Assert.Equal(5, updated.StockQuantity);
        var transactions = await inventory.GetTransactionsAsync(5);
        Assert.Single(transactions);
        Assert.Equal("IMPORT", transactions[0].TransactionType);
        Assert.Equal(3, transactions[0].PreviousStock);
        Assert.Equal(5, transactions[0].NewStock);
        Assert.Equal(2, transactions[0].Quantity);
        await Assert.ThrowsAsync<DomainConflictException>(() =>
            inventory.UpdateStockAsync(5, 1, new UpdateStockDto { TransactionType = "Export", Quantity = 6 }));
        var exported = await inventory.UpdateStockAsync(5, 1, new UpdateStockDto
        {
            TransactionType = "Export", Quantity = 2
        });
        Assert.Equal(3, exported.StockQuantity);
        var latest = (await inventory.GetTransactionsAsync(5))[0];
        Assert.Equal("SALE", latest.TransactionType);
        Assert.Equal(-2, latest.Quantity);
    }

    [Fact]
    public async Task DashboardReportsCompletedOrdersAndSoldProducts()
    {
        await using var db = CreateContext();
        SeedUsersAndOrder(db);
        db.Categories.Add(new Category { CategoryID = 3, CategoryName = "Laptops", IsActive = true });
        db.Brands.Add(new Brand { BrandID = 4, BrandName = "Acme", IsActive = true });
        db.Products.Add(new Product
        {
            ProductID = 5, CategoryID = 3, BrandID = 4, ProductName = "Laptop", SKU = "LAP-5",
            Price = 100m, StockQuantity = 3, IsActive = true
        });
        db.OrderDetails.Add(new OrderDetail
        {
            OrderDetailID = 20, OrderID = 19, ProductID = 5, ProductName = "Laptop", SKU = "LAP-5",
            Quantity = 1, UnitPrice = 100m, TotalPrice = 100m
        });
        await db.SaveChangesAsync();
        var order = await db.Orders.FindAsync(19L);
        order!.OrderStatus = "COMPLETED";
        order.PaymentStatus = "PAID";
        await db.SaveChangesAsync();

        var reports = new ReportService(db);
        var summary = await reports.GetDashboardSummaryAsync();
        Assert.Equal(100m, summary.TotalRevenue);
        Assert.Equal(1, summary.TotalOrders);
        Assert.Equal(1, summary.TotalCustomers);
        Assert.Equal(1, summary.LowStockProducts);
        var top = await reports.GetTopProductsAsync(5);
        Assert.Single(top);
        Assert.Equal("Laptop", top[0].ProductName);
        Assert.Equal(100m, top[0].TotalRevenue);
    }

    private static AppDbContext CreateContext() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static void SeedUsersAndOrder(AppDbContext db)
    {
        db.Roles.AddRange(
            new Role { RoleID = 1, RoleName = "Admin" },
            new Role { RoleID = 2, RoleName = "Customer" });
        db.Users.AddRange(
            new User { UserID = 1, RoleID = 1, Email = "admin@example.test", FullName = "Admin", PasswordHash = "hash", IsActive = true },
            new User { UserID = 2, RoleID = 2, Email = "buyer@example.test", FullName = "Buyer", PasswordHash = "hash", IsActive = true });
        db.Orders.Add(new Order
        {
            OrderID = 19, UserID = 2, ReceiverName = "Buyer", ReceiverPhone = "0900",
            ShippingAddress = "1 Street", SubTotal = 100m, ShippingFee = 0m, TotalAmount = 100m,
            PaymentMethod = "QR", PaymentStatus = "PENDING", OrderStatus = "PENDING"
        });
    }
}
