using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Categories;

/// <summary>
/// Only presence is validated here. Trimming plus the 2-100 / 500 character rules are business
/// invariants owned by <see cref="Services.CategoryService"/> so they are applied to the trimmed value.
/// </summary>
public sealed class CreateCategoryRequest
{
    [Required]
    public string? Name { get; set; }

    public string? Description { get; set; }
}
