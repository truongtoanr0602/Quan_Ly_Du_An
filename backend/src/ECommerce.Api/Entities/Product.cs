namespace ECommerce.Api.Entities;

/// <summary>
/// Sprint 1 persistence model only. The Product API belongs to US-3 and is not implemented here;
/// this Entity exists because US-2 requires Category deletion to be blocked while Products reference it.
/// </summary>
public sealed class Product
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    public Category? Category { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? Brand { get; set; }

    public string? ImageUrl { get; set; }

    public int StockQuantity { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
