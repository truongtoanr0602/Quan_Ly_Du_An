namespace ECommerce.Api.DTOs.Inventory;

public class InventoryDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string Sku { get; set; } = null!;
    public int StockQuantity { get; set; }
    public string CategoryName { get; set; } = null!;
    public string BrandName { get; set; } = null!;
    public bool IsActive { get; set; }
}

public class UpdateStockDto
{
    public int Quantity { get; set; }
    public string TransactionType { get; set; } = null!; // "Import", "Export", "Adjustment"
    public string? Note { get; set; }
}

public class InventoryTransactionDto
{
    public long TransactionId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string TransactionType { get; set; } = null!;
    public int Quantity { get; set; }
    public int PreviousStock { get; set; }
    public int NewStock { get; set; }
    public string? Note { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
}
