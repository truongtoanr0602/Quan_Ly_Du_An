namespace ECommerce.Api.Entities;

public class OrderDetail
{
    public long OrderDetailID { get; set; }

    public long OrderID { get; set; }

    public int ProductID { get; set; }

    // Snapshot sáº£n pháº©m táº¡i thá»i Ä‘iá»ƒm mua
    public string ProductName { get; set; } = null!;

    public string SKU { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    // Computed column: Quantity * UnitPrice
    public decimal TotalPrice { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
