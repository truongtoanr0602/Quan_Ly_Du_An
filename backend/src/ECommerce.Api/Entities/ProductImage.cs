namespace ECommerce.Api.Entities;

public class ProductImage
{
    public int ImageID { get; set; }

    public int ProductID { get; set; }

    public string ImageURL { get; set; } = null!;

    public bool IsPrimary { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation
    public Product Product { get; set; } = null!;
}
