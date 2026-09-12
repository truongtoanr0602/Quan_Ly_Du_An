namespace ECommerce.Api.Entities;


public class OrderStatusHistory
{
    public long HistoryID { get; set; }

    public long OrderID { get; set; }

    public string? OldStatus { get; set; }

    public string NewStatus { get; set; } = null!;

    public string? Note { get; set; }

    public int? ChangedBy { get; set; }

    public DateTime ChangedAt { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
    public User? ChangedByUser { get; set; }
}
