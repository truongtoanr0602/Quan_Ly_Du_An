namespace ECommerce.Api.DTOs.Products;

public record ProductDto(
    int ProductID,
    int CategoryID,
    string CategoryName,
    string ProductName,
    string? Description,
    decimal Price,
    string? BrandName,
    string? ImageUrl,
    int StockQuantity,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
