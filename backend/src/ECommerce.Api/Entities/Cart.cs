namespace ECommerce.Api.Entities;


public class Cart
{
    public int CartID { get; set; }

    public int UserID { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
