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
        var includeInactive = User.IsInRole("Admin");
        var result = await _productService.SearchProductsAsync(request, includeInactive, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProductById(int id, CancellationToken cancellationToken)
    {
        var includeInactive = User.IsInRole("Admin");
        var result = await _productService.GetProductByIdAsync(id, includeInactive, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDto>> CreateProduct(ProductCreateDto dto, CancellationToken cancellationToken)
    {
        var result = await _productService.CreateProductAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetProductById), new { id = result.ProductID }, result);
    }

    [HttpPut("{id}")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, ProductUpdateDto dto, CancellationToken cancellationToken)
    {
        var result = await _productService.UpdateProductAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken cancellationToken)
    {
        await _productService.DeleteProductAsync(id, cancellationToken);
        return NoContent();
    }
}
