using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Categories;

public class CategoryUpdateDto
{
    [Required(ErrorMessage = "Category Name is required")]
    [StringLength(100, ErrorMessage = "Category Name cannot exceed 100 characters")]
    public string CategoryName { get; set; } = null!;

    public int? ParentID { get; set; }

    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string? Description { get; set; }

    public bool IsActive { get; set; }
}
