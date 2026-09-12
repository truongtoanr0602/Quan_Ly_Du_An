namespace ECommerce.Api.DTOs.Products;

public record ProductDto(
    int ProductID,
    int CategoryID,
    string CategoryName,
    string ProductName,
    string SKU,
    string? Description,
    decimal Price,
    int BrandID,
    string? BrandName,
    string? ImageUrl,
    int StockQuantity,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
