namespace ECommerce.Api.Entities;

public class Category
{
    public int CategoryID { get; set; }

    public string CategoryName { get; set; } = null!;

    public int? ParentID { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation Self-referencing
    public Category? Parent { get; set; }
    public ICollection<Category> Children { get; set; } = new List<Category>();

    // Navigation Products
    public ICollection<Product> Products { get; set; } = new List<Product>();
}