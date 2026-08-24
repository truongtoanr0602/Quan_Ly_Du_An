using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Categories;

public sealed class UpdateCategoryRequest
{
    [Required]
    public string? Name { get; set; }

    public string? Description { get; set; }
}
