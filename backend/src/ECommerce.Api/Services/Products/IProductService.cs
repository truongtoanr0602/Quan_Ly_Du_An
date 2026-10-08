using ECommerce.Api.DTOs;
using ECommerce.Api.DTOs.Products;

namespace ECommerce.Api.Services.Products;

public interface IProductService
{
    Task<PagedResult<ProductDto>> SearchProductsAsync(ProductSearchRequestDto request, bool includeInactive, CancellationToken cancellationToken = default);
    Task<ProductDto> GetProductByIdAsync(int id, bool includeInactive, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateProductAsync(ProductCreateDto dto, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateProductAsync(int id, ProductUpdateDto dto, CancellationToken cancellationToken = default);
    Task DeleteProductAsync(int id, CancellationToken cancellationToken = default);
}
