namespace ECommerce.Api.Entities;

public class Brand
{
    public int BrandID { get; set; }

    public string BrandName { get; set; } = null!;

    public string? Description { get; set; }

    public string? LogoURL { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
