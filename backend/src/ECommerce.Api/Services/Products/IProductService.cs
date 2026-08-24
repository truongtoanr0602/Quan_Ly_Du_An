using ECommerce.Api.DTOs;
using ECommerce.Api.DTOs.Products;

namespace ECommerce.Api.Services.Products;

public interface IProductService
{
    Task<PagedResult<ProductDto>> SearchProductsAsync(ProductSearchRequestDto request, CancellationToken cancellationToken = default);
}
