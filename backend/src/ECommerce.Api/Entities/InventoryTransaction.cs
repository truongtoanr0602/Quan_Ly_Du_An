namespace ECommerce.Api.Entities;


public class InventoryTransaction
{
    public long InventoryTransactionID { get; set; }

    public int ProductID { get; set; }

    public string TransactionType { get; set; } = null!;

    public int Quantity { get; set; }

    public int PreviousStock { get; set; }

    public int NewStock { get; set; }

    public long? ReferenceID { get; set; }

    public string? Note { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation
    public Product Product { get; set; } = null!;
    public User? CreatedByUser { get; set; }
}
