using System.Net;
using System.Net.Http.Json;
using ECommerce.Api.DTOs;
using ECommerce.Api.DTOs.Products;
using ECommerce.Api.Exceptions;
using ECommerce.Api.Services.Products;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Tests;

public sealed class ProductsControllerTests
{
    [Fact]
    public async Task PublicInactiveDetailReturnsNotFound()
    {
        var service = new ThrowingProductService(new ResourceNotFoundException());
        using var factory = CreateProductFactory(service);
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/products/42");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AdminDetailPassesIncludeInactiveToProductService()
    {
        var service = new RecordingProductService();
        using var factory = CreateProductFactory(service);
        using var client = factory.CreateClientWithRole("Admin");

        using var response = await client.GetAsync("/api/products/42");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(service.LastIncludeInactive);
    }

    [Theory]
    [InlineData(null, false)]
    [InlineData("Customer", false)]
    [InlineData("Admin", true)]
    public async Task ProductCollectionPassesVisibilityByRole(string? role, bool expectedIncludeInactive)
    {
        var service = new RecordingProductService();
        using var factory = CreateProductFactory(service);
        using var client = factory.CreateClientWithRole(role);

        using var response = await client.GetAsync("/api/products");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(expectedIncludeInactive, service.LastIncludeInactive);
    }

    [Fact]
    public async Task AnonymousCannotMutateProducts()
    {
        using var factory = CreateProductFactory(new RecordingProductService());
        using var client = factory.CreateClientWithRole(null);

        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.PostAsJsonAsync("/api/products", CreateProduct())).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.PutAsJsonAsync("/api/products/42", CreateUpdate())).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.DeleteAsync("/api/products/42")).StatusCode);
    }

    [Fact]
    public async Task CustomerCannotMutateProducts()
    {
        using var factory = CreateProductFactory(new RecordingProductService());
        using var client = factory.CreateClientWithRole("Customer");

        Assert.Equal(HttpStatusCode.Forbidden,
            (await client.PostAsJsonAsync("/api/products", CreateProduct())).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,
            (await client.PutAsJsonAsync("/api/products/42", CreateUpdate())).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,
            (await client.DeleteAsync("/api/products/42")).StatusCode);
    }

    [Fact]
    public async Task AdminCanReachEachProductMutationWithServiceDouble()
    {
        var service = new RecordingProductService();
        using var factory = CreateProductFactory(service);
        using var client = factory.CreateClientWithRole("Admin");

        Assert.Equal(HttpStatusCode.Created,
            (await client.PostAsJsonAsync("/api/products", CreateProduct())).StatusCode);
        Assert.Equal(HttpStatusCode.OK,
            (await client.PutAsJsonAsync("/api/products/42", CreateUpdate())).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent,
            (await client.DeleteAsync("/api/products/42")).StatusCode);

        Assert.True(service.CreateCalled);
        Assert.True(service.UpdateCalled);
        Assert.True(service.DeleteCalled);
    }

    private static TestApiFactory CreateProductFactory(IProductService service) =>
        new(configureTestServices: services =>
        {
            services.AddSingleton(service);
            services.AddSingleton<IProductService>(service);
        });

    private static ProductCreateDto CreateProduct() => new()
    {
        CategoryID = 1,
        ProductName = "Test product",
        SKU = "TEST-42",
        Price = 10,
        BrandID = 1,
        StockQuantity = 1
    };

    private static ProductUpdateDto CreateUpdate() => new()
    {
        CategoryID = 1,
        ProductName = "Updated product",
        SKU = "TEST-42",
        Price = 12,
        BrandID = 1,
        StockQuantity = 2,
        IsActive = true
    };

    private sealed class ThrowingProductService(Exception exception) : IProductService
    {
        public Task<PagedResult<ProductDto>> SearchProductsAsync(ProductSearchRequestDto request, bool includeInactive, CancellationToken cancellationToken = default) =>
            Task.FromResult(new PagedResult<ProductDto>());

        public Task<ProductDto> GetProductByIdAsync(int id, bool includeInactive, CancellationToken cancellationToken = default) =>
            Task.FromException<ProductDto>(exception);

        public Task<ProductDto> CreateProductAsync(ProductCreateDto dto, CancellationToken cancellationToken = default) =>
            Task.FromResult(RecordingProductService.ValidProduct);

        public Task<ProductDto> UpdateProductAsync(int id, ProductUpdateDto dto, CancellationToken cancellationToken = default) =>
            Task.FromResult(RecordingProductService.ValidProduct);

        public Task DeleteProductAsync(int id, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }

    private sealed class RecordingProductService : IProductService
    {
        internal static readonly ProductDto ValidProduct = new(
            42, 1, "Category", "Product", "SKU-42", null, 10, 1, "Brand", null, 1, true,
            DateTime.UtcNow, null);

        public bool LastIncludeInactive { get; private set; }
        public bool CreateCalled { get; private set; }
        public bool UpdateCalled { get; private set; }
        public bool DeleteCalled { get; private set; }

        public Task<PagedResult<ProductDto>> SearchProductsAsync(ProductSearchRequestDto request, bool includeInactive, CancellationToken cancellationToken = default)
        {
            LastIncludeInactive = includeInactive;
            return Task.FromResult(new PagedResult<ProductDto>
            {
                Items = [ValidProduct],
                TotalCount = 1,
                PageNumber = 1,
                PageSize = 10
            });
        }

        public Task<ProductDto> GetProductByIdAsync(int id, bool includeInactive, CancellationToken cancellationToken = default)
        {
            LastIncludeInactive = includeInactive;
            return Task.FromResult(ValidProduct);
        }

        public Task<ProductDto> CreateProductAsync(ProductCreateDto dto, CancellationToken cancellationToken = default)
        {
            CreateCalled = true;
            return Task.FromResult(ValidProduct);
        }

        public Task<ProductDto> UpdateProductAsync(int id, ProductUpdateDto dto, CancellationToken cancellationToken = default)
        {
            UpdateCalled = true;
            return Task.FromResult(ValidProduct);
        }

        public Task DeleteProductAsync(int id, CancellationToken cancellationToken = default)
        {
            DeleteCalled = true;
            return Task.CompletedTask;
        }
    }
}
