using ECommerce.Api.DTOs;
using ECommerce.Api.DTOs.Products;
using ECommerce.Api.Services.Products;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts([FromQuery] ProductSearchRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _productService.SearchProductsAsync(request, cancellationToken);
        return Ok(result);
    }
}
