namespace ECommerce.Api.Entities;


public class Product
{
    public int ProductID { get; set; }

    public int CategoryID { get; set; }

    public int BrandID { get; set; }

    public string SKU { get; set; } = null!;

    public string ProductName { get; set; } = null!;

    public string? Description { get; set; }

    public string? Specifications { get; set; }

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public Category Category { get; set; } = null!;
    public Brand Brand { get; set; } = null!;
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}
