using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Chat;
using ECommerce.Api.Entities;
using ECommerce.Api.Services.Chat;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace ECommerce.Api.Tests;

public sealed class ChatServiceTests
{
    [Fact]
    public async Task WithoutAiKeyRecommendsMatchingActiveInStockProducts()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Categories.Add(new Category { CategoryID = 1, CategoryName = "Laptops", IsActive = true });
        db.Brands.Add(new Brand { BrandID = 1, BrandName = "Acme", IsActive = true });
        db.Products.AddRange(
            new Product { ProductID = 5, CategoryID = 1, BrandID = 1, ProductName = "Laptop Acme", SKU = "LAP-5", Price = 100m, StockQuantity = 3, IsActive = true },
            new Product { ProductID = 6, CategoryID = 1, BrandID = 1, ProductName = "Laptop hidden", SKU = "LAP-6", Price = 80m, StockQuantity = 3, IsActive = false },
            new Product { ProductID = 7, CategoryID = 1, BrandID = 1, ProductName = "Laptop empty", SKU = "LAP-7", Price = 90m, StockQuantity = 0, IsActive = true });
        await db.SaveChangesAsync();
        var configuration = new ConfigurationBuilder().AddInMemoryCollection().Build();
        var service = new ChatService(db, new HttpClient(), configuration, NullLogger<ChatService>.Instance);

        var result = await service.ChatAsync(new ChatRequestDto("Gợi ý laptop", null));

        Assert.Contains("Laptop", result.Reply, StringComparison.OrdinalIgnoreCase);
        Assert.Single(result.Products!);
        Assert.Equal(5, result.Products![0].ProductId);
    }
}
