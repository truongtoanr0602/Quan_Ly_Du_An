namespace ECommerce.Api.Entities;


public class CartItem
{
    public long CartItemID { get; set; }

    public int CartID { get; set; }

    public int ProductID { get; set; }

    public int Quantity { get; set; }

    public DateTime AddedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public Cart Cart { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
