namespace ECommerce.Api.DTOs.Carts;

public class CartDto
{
    public int CartId { get; set; }
    public List<CartItemDto> Items { get; set; } = [];
    public decimal TotalPrice { get; set; }
    public int TotalItems { get; set; }
}

public class CartItemDto
{
    public long CartItemId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int StockQuantity { get; set; }
    public decimal SubTotal { get; set; }
}
