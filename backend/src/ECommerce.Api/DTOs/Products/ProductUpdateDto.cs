using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Products;

public class ProductUpdateDto
{
    [Required]
    public int CategoryID { get; set; }

    [Required]
    [MaxLength(200)]
    public string ProductName { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string SKU { get; set; } = null!;

    public string? Description { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Price must be positive")]
    public decimal Price { get; set; }

    [Required]
    public int BrandID { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stock must be positive")]
    public int StockQuantity { get; set; }

    public string? ImageUrl { get; set; }
    
    public bool IsActive { get; set; } = true;
}
