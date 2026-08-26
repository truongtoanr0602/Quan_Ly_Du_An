namespace ECommerce.Api.Entities;


public class Order
{
    public long OrderID { get; set; }

    public int UserID { get; set; }

    // Snapshot thÃ´ng tin giao hÃ ng
    public string ReceiverName { get; set; } = null!;

    public string ReceiverPhone { get; set; } = null!;

    public string? Province { get; set; }

    public string? District { get; set; }

    public string? Ward { get; set; }

    public string ShippingAddress { get; set; } = null!;

    public decimal SubTotal { get; set; }

    public decimal ShippingFee { get; set; }

    public decimal TotalAmount { get; set; }

    public string PaymentMethod { get; set; } = null!;

    public string PaymentStatus { get; set; } = null!;

    public string OrderStatus { get; set; } = null!;

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? ConfirmedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    public ICollection<OrderStatusHistory> StatusHistories { get; set; } = new List<OrderStatusHistory>();
}
