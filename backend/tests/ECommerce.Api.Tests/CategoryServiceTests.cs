using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Categories;
using ECommerce.Api.Entities;
using ECommerce.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Tests;

/// <summary>
/// US-2 business rules verified at the Service layer.
/// </summary>
public sealed class CategoryServiceTests
{
    [Fact]
    public async Task GetAllAsyncReturnsCategoriesOrderedByName()
    {
        await using var dbContext = CreateDbContext();
        dbContext.Categories.AddRange(NewCategory("Shoes"), NewCategory("Books"));
        await dbContext.SaveChangesAsync();
        var service = new CategoryService(dbContext);

        var categories = await service.GetAllAsync(CancellationToken.None);

        Assert.Equal(
            new[] { "Books", "Shoes" },
            categories.Select(category => category.Name).ToArray());
    }

    [Fact]
    public async Task GetByIdAsyncReturnsNotFoundWhenCategoryDoesNotExist()
    {
        await using var dbContext = CreateDbContext();
        var service = new CategoryService(dbContext);

        var result = await service.GetByIdAsync(404, CancellationToken.None);

        Assert.Equal(ServiceStatus.NotFound, result.Status);
    }

    [Fact]
    public async Task CreateAsyncTrimsNameAndDescriptionAndStampsCreatedAt()
    {
        await using var dbContext = CreateDbContext();
        var service = new CategoryService(dbContext);
        var before = DateTime.UtcNow;

        var result = await service.CreateAsync(
            new CreateCategoryRequest { Name = "  Books  ", Description = "  Reading  " },
            CancellationToken.None);

        Assert.Equal(ServiceStatus.Success, result.Status);
        Assert.NotNull(result.Value);
        Assert.Equal("Books", result.Value.Name);
        Assert.Equal("Reading", result.Value.Description);
        Assert.InRange(result.Value.CreatedAt, before, DateTime.UtcNow);
        Assert.True(result.Value.Id > 0);
    }

    [Fact]
    public async Task CreateAsyncStoresNullDescriptionWhenOnlyWhitespaceIsSupplied()
    {
        await using var dbContext = CreateDbContext();
        var service = new CategoryService(dbContext);

        var result = await service.CreateAsync(
            new CreateCategoryRequest { Name = "Books", Description = "   " },
            CancellationToken.None);

        Assert.Equal(ServiceStatus.Success, result.Status);
        Assert.Null(result.Value!.Description);
    }

    [Theory]
    [InlineData("  ")]
    [InlineData("A")]
    [InlineData("  A  ")]
    public async Task CreateAsyncReturnsInvalidWhenTrimmedNameIsTooShort(string name)
    {
        await using var dbContext = CreateDbContext();
        var service = new CategoryService(dbContext);

        var result = await service.CreateAsync(
            new CreateCategoryRequest { Name = name },
            CancellationToken.None);

        Assert.Equal(ServiceStatus.Invalid, result.Status);
        Assert.NotNull(result.Errors);
        Assert.True(result.Errors.ContainsKey(nameof(CreateCategoryRequest.Name)));
    }

    [Fact]
    public async Task CreateAsyncReturnsInvalidWhenNameExceedsMaximumLength()
    {
        await using var dbContext = CreateDbContext();
        var service = new CategoryService(dbContext);

        var result = await service.CreateAsync(
            new CreateCategoryRequest { Name = new string('a', 101) },
            CancellationToken.None);

        Assert.Equal(ServiceStatus.Invalid, result.Status);
    }

    [Fact]
    public async Task CreateAsyncReturnsInvalidWhenDescriptionExceedsMaximumLength()
    {
        await using var dbContext = CreateDbContext();
        var service = new CategoryService(dbContext);

        var result = await service.CreateAsync(
            new CreateCategoryRequest { Name = "Books", Description = new string('a', 501) },
            CancellationToken.None);

        Assert.Equal(ServiceStatus.Invalid, result.Status);
        Assert.NotNull(result.Errors);
        Assert.True(result.Errors.ContainsKey(nameof(CreateCategoryRequest.Description)));
    }

    [Fact]
    public async Task CreateAsyncReturnsConflictWhenNameMatchesIgnoringCaseAndSurroundingSpace()
    {
        await using var dbContext = CreateDbContext();
        dbContext.Categories.Add(NewCategory("Books"));
        await dbContext.SaveChangesAsync();
        var service = new CategoryService(dbContext);

        var result = await service.CreateAsync(
            new CreateCategoryRequest { Name = "  bOOks  " },
            CancellationToken.None);

        Assert.Equal(ServiceStatus.Conflict, result.Status);
    }

    [Fact]
    public async Task UpdateAsyncChangesNameAndDescriptionAndKeepsCreatedAt()
    {
        await using var dbContext = CreateDbContext();
        var existing = NewCategory("Books");
        dbContext.Categories.Add(existing);
        await dbContext.SaveChangesAsync();
        var service = new CategoryService(dbContext);

        var result = await service.UpdateAsync(
            existing.Id,
            new UpdateCategoryRequest { Name = " Novels ", Description = "Fiction" },
            CancellationToken.None);

        Assert.Equal(ServiceStatus.Success, result.Status);
        Assert.Equal("Novels", result.Value!.Name);
        Assert.Equal("Fiction", result.Value.Description);
        Assert.Equal(existing.CreatedAt, result.Value.CreatedAt);
    }

    [Fact]
    public async Task UpdateAsyncAllowsACategoryToKeepItsOwnNameInADifferentCase()
    {
        await using var dbContext = CreateDbContext();
        var existing = NewCategory("Books");
        dbContext.Categories.Add(existing);
        await dbContext.SaveChangesAsync();
        var service = new CategoryService(dbContext);

        var result = await service.UpdateAsync(
            existing.Id,
            new UpdateCategoryRequest { Name = "BOOKS" },
            CancellationToken.None);

        Assert.Equal(ServiceStatus.Success, result.Status);
        Assert.Equal("BOOKS", result.Value!.Name);
    }

    [Fact]
    public async Task UpdateAsyncReturnsConflictWhenAnotherCategoryAlreadyUsesTheName()
    {
        await using var dbContext = CreateDbContext();
        var books = NewCategory("Books");
        var shoes = NewCategory("Shoes");
        dbContext.Categories.AddRange(books, shoes);
        await dbContext.SaveChangesAsync();
        var service = new CategoryService(dbContext);

        var result = await service.UpdateAsync(
            shoes.Id,
            new UpdateCategoryRequest { Name = "books" },
            CancellationToken.None);

        Assert.Equal(ServiceStatus.Conflict, result.Status);
    }

    [Fact]
    public async Task UpdateAsyncReturnsNotFoundWhenCategoryDoesNotExist()
    {
        await using var dbContext = CreateDbContext();
        var service = new CategoryService(dbContext);

        var result = await service.UpdateAsync(
            404,
            new UpdateCategoryRequest { Name = "Books" },
            CancellationToken.None);

        Assert.Equal(ServiceStatus.NotFound, result.Status);
    }

    [Fact]
    public async Task DeleteAsyncRemovesCategoryWithoutProducts()
    {
        await using var dbContext = CreateDbContext();
        var category = NewCategory("Books");
        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync();
        var service = new CategoryService(dbContext);

        var result = await service.DeleteAsync(category.Id, CancellationToken.None);

        Assert.Equal(ServiceStatus.Success, result.Status);
        Assert.Empty(await dbContext.Categories.ToListAsync());
    }

    [Fact]
    public async Task DeleteAsyncReturnsConflictWhenCategoryStillHasProducts()
    {
        await using var dbContext = CreateDbContext();
        var category = NewCategory("Books");
        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync();
        dbContext.Products.Add(NewProduct(category.Id));
        await dbContext.SaveChangesAsync();
        var service = new CategoryService(dbContext);

        var result = await service.DeleteAsync(category.Id, CancellationToken.None);

        Assert.Equal(ServiceStatus.Conflict, result.Status);
        Assert.Single(await dbContext.Categories.ToListAsync());
    }

    [Fact]
    public async Task DeleteAsyncReturnsNotFoundWhenCategoryDoesNotExist()
    {
        await using var dbContext = CreateDbContext();
        var service = new CategoryService(dbContext);

        var result = await service.DeleteAsync(404, CancellationToken.None);

        Assert.Equal(ServiceStatus.NotFound, result.Status);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"category-service-{Guid.NewGuid():N}")
            .Options;

        return new AppDbContext(options);
    }

    private static Category NewCategory(string name) =>
        new() { Name = name, CreatedAt = DateTime.UtcNow };

    private static Product NewProduct(int categoryId) => new()
    {
        CategoryId = categoryId,
        Name = "Sample product",
        Price = 10m,
        StockQuantity = 1,
        CreatedAt = DateTime.UtcNow
    };
}
