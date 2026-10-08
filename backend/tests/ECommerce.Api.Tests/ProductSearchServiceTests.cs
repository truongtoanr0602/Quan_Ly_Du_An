using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Products;
using ECommerce.Api.Entities;
using ECommerce.Api.Services.Products;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Tests;

public sealed class ProductSearchServiceTests
{
    [Fact]
    public async Task PriceSortHappensBeforePagination()
    {
        await using var db = CreateContext();
        db.Products.AddRange(Product(1, 50m), Product(2, 10m), Product(3, 30m));
        await db.SaveChangesAsync();

        var result = await new ProductService(db).SearchProductsAsync(
            new ProductSearchRequestDto(null, null, null, null, null, 1, 2, "price_asc"), false);

        Assert.Equal([2, 3], result.Items.Select(item => item.ProductID));
        Assert.Equal(3, result.TotalCount);
    }

    [Fact]
    public async Task BrandOptionsIncludeEveryActiveProductBrand()
    {
        await using var db = CreateContext();
        db.Products.AddRange(Product(1, 50m, "Apple"), Product(2, 10m, "Logitech"),
            Product(3, 20m, "Hidden", active: false));
        await db.SaveChangesAsync();

        var brands = await new ProductService(db).GetActiveBrandsAsync();

        Assert.Equal(["Apple", "Logitech"], brands);
    }

    private static AppDbContext CreateContext() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static Product Product(int id, decimal price, string brand = "Apple", bool active = true) => new()
    {
        ProductID = id,
        CategoryID = id,
        Category = new Category { CategoryID = id, CategoryName = "Laptops", IsActive = true },
        BrandID = id,
        Brand = new Brand { BrandID = id, BrandName = brand, IsActive = true },
        ProductName = $"Product {id}", SKU = $"SKU-{id}", Price = price, StockQuantity = 5,
        IsActive = active, CreatedAt = new DateTime(2026, 1, id)
    };
}
