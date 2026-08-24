using System.Net;
using System.Net.Http.Json;
using ECommerce.Api.DTOs.Categories;
using ECommerce.Api.Entities;

namespace ECommerce.Api.Tests;

/// <summary>
/// US-2 observable HTTP behavior: public reads, Admin-only writes, and the documented status codes.
/// </summary>
public sealed class CategoriesEndpointTests
{
    [Fact]
    public async Task GetAllIsPubliclyAccessible()
    {
        using var factory = new ApiWebApplicationFactory();
        await factory.SeedAsync(dbContext =>
        {
            dbContext.Categories.Add(new Category { Name = "Books", CreatedAt = DateTime.UtcNow });
            return Task.CompletedTask;
        });
        using var client = factory.CreateAnonymousClient();

        using var response = await client.GetAsync("/api/categories");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var categories = await response.Content.ReadFromJsonAsync<List<CategoryResponse>>();
        Assert.NotNull(categories);
        Assert.Single(categories);
    }

    [Fact]
    public async Task GetByIdIsPubliclyAccessible()
    {
        using var factory = new ApiWebApplicationFactory();
        var category = new Category { Name = "Books", CreatedAt = DateTime.UtcNow };
        await factory.SeedAsync(dbContext =>
        {
            dbContext.Categories.Add(category);
            return Task.CompletedTask;
        });
        using var client = factory.CreateAnonymousClient();

        using var response = await client.GetAsync($"/api/categories/{category.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<CategoryResponse>();
        Assert.Equal("Books", payload!.Name);
    }

    [Fact]
    public async Task GetByIdReturnsNotFoundForUnknownCategory()
    {
        using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateAnonymousClient();

        using var response = await client.GetAsync("/api/categories/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateReturnsUnauthorizedWhenCallerIsAnonymous()
    {
        using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateAnonymousClient();

        using var response = await client.PostAsJsonAsync(
            "/api/categories",
            new CreateCategoryRequest { Name = "Books" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateReturnsForbiddenForCustomerRole()
    {
        using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClientForRole(UserRoles.Customer);

        using var response = await client.PostAsJsonAsync(
            "/api/categories",
            new CreateCategoryRequest { Name = "Books" });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task CreateReturnsCreatedForAdminRole()
    {
        using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClientForRole(UserRoles.Admin);

        using var response = await client.PostAsJsonAsync(
            "/api/categories",
            new CreateCategoryRequest { Name = "  Books  ", Description = "Reading" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var created = await response.Content.ReadFromJsonAsync<CategoryResponse>();
        Assert.Equal("Books", created!.Name);
    }

    [Fact]
    public async Task CreateReturnsBadRequestWhenNameIsMissing()
    {
        using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClientForRole(UserRoles.Admin);

        using var response = await client.PostAsJsonAsync(
            "/api/categories",
            new CreateCategoryRequest { Name = null });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateReturnsBadRequestWhenNameIsOnlyWhitespace()
    {
        using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClientForRole(UserRoles.Admin);

        using var response = await client.PostAsJsonAsync(
            "/api/categories",
            new CreateCategoryRequest { Name = "   " });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateReturnsConflictForDuplicateNameIgnoringCase()
    {
        using var factory = new ApiWebApplicationFactory();
        await factory.SeedAsync(dbContext =>
        {
            dbContext.Categories.Add(new Category { Name = "Books", CreatedAt = DateTime.UtcNow });
            return Task.CompletedTask;
        });
        using var client = factory.CreateClientForRole(UserRoles.Admin);

        using var response = await client.PostAsJsonAsync(
            "/api/categories",
            new CreateCategoryRequest { Name = "bOOKS" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task UpdateReturnsUnauthorizedWhenCallerIsAnonymous()
    {
        using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateAnonymousClient();

        using var response = await client.PutAsJsonAsync(
            "/api/categories/1",
            new UpdateCategoryRequest { Name = "Books" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateSucceedsForAdminRole()
    {
        using var factory = new ApiWebApplicationFactory();
        var category = new Category { Name = "Books", CreatedAt = DateTime.UtcNow };
        await factory.SeedAsync(dbContext =>
        {
            dbContext.Categories.Add(category);
            return Task.CompletedTask;
        });
        using var client = factory.CreateClientForRole(UserRoles.Admin);

        using var response = await client.PutAsJsonAsync(
            $"/api/categories/{category.Id}",
            new UpdateCategoryRequest { Name = "Novels", Description = "Fiction" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<CategoryResponse>();
        Assert.Equal("Novels", updated!.Name);
    }

    [Fact]
    public async Task UpdateReturnsNotFoundForUnknownCategory()
    {
        using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClientForRole(UserRoles.Admin);

        using var response = await client.PutAsJsonAsync(
            "/api/categories/999",
            new UpdateCategoryRequest { Name = "Books" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteReturnsUnauthorizedWhenCallerIsAnonymous()
    {
        using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateAnonymousClient();

        using var response = await client.DeleteAsync("/api/categories/1");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeleteReturnsForbiddenForCustomerRole()
    {
        using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClientForRole(UserRoles.Customer);

        using var response = await client.DeleteAsync("/api/categories/1");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DeleteReturnsNoContentForAdminRole()
    {
        using var factory = new ApiWebApplicationFactory();
        var category = new Category { Name = "Books", CreatedAt = DateTime.UtcNow };
        await factory.SeedAsync(dbContext =>
        {
            dbContext.Categories.Add(category);
            return Task.CompletedTask;
        });
        using var client = factory.CreateClientForRole(UserRoles.Admin);

        using var response = await client.DeleteAsync($"/api/categories/{category.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeleteReturnsConflictWhenCategoryStillHasProducts()
    {
        using var factory = new ApiWebApplicationFactory();
        var category = new Category { Name = "Books", CreatedAt = DateTime.UtcNow };
        await factory.SeedAsync(dbContext =>
        {
            dbContext.Categories.Add(category);
            return Task.CompletedTask;
        });
        await factory.SeedAsync(dbContext =>
        {
            dbContext.Products.Add(new Product
            {
                CategoryId = category.Id,
                Name = "Sample product",
                Price = 10m,
                StockQuantity = 1,
                CreatedAt = DateTime.UtcNow
            });
            return Task.CompletedTask;
        });
        using var client = factory.CreateClientForRole(UserRoles.Admin);

        using var response = await client.DeleteAsync($"/api/categories/{category.Id}");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
