using System.Net;
using System.Net.Http.Json;
using ECommerce.Api.DTOs.Categories;
using ECommerce.Api.Services.Categories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ECommerce.Api.Tests;

public sealed class CategoriesControllerTests
{
    [Theory]
    [InlineData(HttpStatusCode.Unauthorized, null, "POST")]
    [InlineData(HttpStatusCode.Forbidden, "Customer", "POST")]
    [InlineData(HttpStatusCode.Unauthorized, null, "PUT")]
    [InlineData(HttpStatusCode.Forbidden, "Customer", "PUT")]
    [InlineData(HttpStatusCode.Unauthorized, null, "DELETE")]
    [InlineData(HttpStatusCode.Forbidden, "Customer", "DELETE")]
    public async Task CategoryMutationRejectsNonAdmin(HttpStatusCode expected, string? role, string method)
    {
        using var factory = new TestApiFactory();
        using var client = factory.CreateClientWithRole(role);

        using var response = method switch
        {
            "POST" => await client.PostAsJsonAsync(
                "/api/categories",
                new CategoryCreateDto { CategoryName = "Audio", IsActive = true }),
            "PUT" => await client.PutAsJsonAsync(
                "/api/categories/1",
                new CategoryUpdateDto { CategoryName = "Audio", IsActive = true }),
            "DELETE" => await client.DeleteAsync("/api/categories/1"),
            _ => throw new ArgumentOutOfRangeException(nameof(method), method, null)
        };

        Assert.Equal(expected, response.StatusCode);
    }

    [Fact]
    public async Task AdminDeleteMissingCategoryReturnsNotFoundProblem()
    {
        using var factory = CreateFactory((_, _) =>
            Task.FromException(new ECommerce.Api.Exceptions.ResourceNotFoundException()));
        using var client = factory.CreateClientWithRole("Admin");

        using var response = await client.DeleteAsync("/api/categories/404");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task AdminDeleteCategoryWithDependenciesReturnsConflictProblem()
    {
        using var factory = CreateFactory((_, _) =>
            Task.FromException(new ECommerce.Api.Exceptions.DomainConflictException()));
        using var client = factory.CreateClientWithRole("Admin");

        using var response = await client.DeleteAsync("/api/categories/1");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task AdminDeleteEmptyLeafCategoryReturnsNoContent()
    {
        using var factory = CreateFactory((_, _) => Task.CompletedTask);
        using var client = factory.CreateClientWithRole("Admin");

        using var response = await client.DeleteAsync("/api/categories/1");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private static TestApiFactory CreateFactory(
        Func<int, CancellationToken, Task> deleteCategory)
    {
        return new TestApiFactory(configureTestServices: services =>
        {
            services.RemoveAll<ICategoryService>();
            services.AddScoped<ICategoryService>(_ => new TestCategoryService(deleteCategory));
        });
    }

    private sealed class TestCategoryService(
        Func<int, CancellationToken, Task> deleteCategory) : ICategoryService
    {
        public Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync(
            CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<CategoryDto> GetCategoryByIdAsync(
            int id,
            CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<CategoryDto> CreateCategoryAsync(
            CategoryCreateDto dto,
            CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<CategoryDto> UpdateCategoryAsync(
            int id,
            CategoryUpdateDto dto,
            CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task DeleteCategoryAsync(
            int id,
            CancellationToken cancellationToken = default) =>
            deleteCategory(id, cancellationToken);
    }
}
