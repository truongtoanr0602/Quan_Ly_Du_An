using ECommerce.Api.DTOs.Categories;
using ECommerce.Api.Services.Categories;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories(CancellationToken cancellationToken)
    {
        var result = await _categoryService.GetAllCategoriesAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id, CancellationToken cancellationToken)
    {
        var result = await _categoryService.GetCategoryByIdAsync(id, cancellationToken);
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CategoryCreateDto dto, CancellationToken cancellationToken)
    {
        var result = await _categoryService.CreateCategoryAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetCategory), new { id = result.CategoryID }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, [FromBody] CategoryUpdateDto dto, CancellationToken cancellationToken)
    {
        var result = await _categoryService.UpdateCategoryAsync(id, dto, cancellationToken);
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id, CancellationToken cancellationToken)
    {
        var success = await _categoryService.DeleteCategoryAsync(id, cancellationToken);
        if (!success)
            return NotFound();
            
        return NoContent();
    }
}
