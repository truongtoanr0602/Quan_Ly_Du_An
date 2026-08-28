namespace ECommerce.Api.DTOs.Categories;

public class CategoryDto
{
    public int CategoryID { get; set; }
    public string CategoryName { get; set; } = null!;
    public int? ParentID { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
