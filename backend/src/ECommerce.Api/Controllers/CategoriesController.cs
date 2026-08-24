using ECommerce.Api.DTOs.Categories;
using ECommerce.Api.Entities;
using ECommerce.Api.Services;
using ECommerce.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

/// <summary>
/// US-2 - Category management. Routes are fixed by docs/architecture.md section 11.
/// </summary>
[ApiController]
[Route("api/categories")]
[Produces("application/json")]
public sealed class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IReadOnlyList<CategoryResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CategoryResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var categories = await categoryService.GetAllAsync(cancellationToken);
        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CategoryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CategoryResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await categoryService.GetByIdAsync(id, cancellationToken);

        return result.Status switch
        {
            ServiceStatus.Success => Ok(result.Value),
            _ => NotFoundProblem(result.Detail)
        };
    }

    [HttpPost]
    [Authorize(Roles = UserRoles.Admin)]
    [ProducesResponseType(typeof(CategoryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CategoryResponse>> Create(
        CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await categoryService.CreateAsync(request, cancellationToken);

        return result.Status switch
        {
            ServiceStatus.Success => CreatedAtAction(
                nameof(GetById),
                new { id = result.Value!.Id },
                result.Value),
            ServiceStatus.Invalid => InvalidProblem(result.Errors),
            ServiceStatus.Conflict => ConflictProblem(result.Detail),
            _ => NotFoundProblem(result.Detail)
        };
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = UserRoles.Admin)]
    [ProducesResponseType(typeof(CategoryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CategoryResponse>> Update(
        int id,
        UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await categoryService.UpdateAsync(id, request, cancellationToken);

        return result.Status switch
        {
            ServiceStatus.Success => Ok(result.Value),
            ServiceStatus.Invalid => InvalidProblem(result.Errors),
            ServiceStatus.Conflict => ConflictProblem(result.Detail),
            _ => NotFoundProblem(result.Detail)
        };
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = UserRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await categoryService.DeleteAsync(id, cancellationToken);

        return result.Status switch
        {
            ServiceStatus.Success => NoContent(),
            ServiceStatus.Conflict => ConflictProblem(result.Detail),
            _ => NotFoundProblem(result.Detail)
        };
    }

    private ActionResult InvalidProblem(IReadOnlyDictionary<string, string[]>? errors)
    {
        var descriptor = new ValidationProblemDetails(
            errors?.ToDictionary(entry => entry.Key, entry => entry.Value) ?? [])
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "One or more validation errors occurred."
        };

        return ValidationProblem(descriptor);
    }

    private ObjectResult NotFoundProblem(string? detail) =>
        Problem(detail: detail, statusCode: StatusCodes.Status404NotFound, title: "Category not found.");

    private ObjectResult ConflictProblem(string? detail) =>
        Problem(detail: detail, statusCode: StatusCodes.Status409Conflict, title: "Request conflicts with current state.");
}
