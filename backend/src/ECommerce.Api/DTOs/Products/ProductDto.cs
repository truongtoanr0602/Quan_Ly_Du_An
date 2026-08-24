namespace ECommerce.Api.DTOs.Products;

public record ProductDto(
    int Id,
    int CategoryId,
    string CategoryName,
    string Name,
    string? Description,
    decimal Price,
    string? Brand,
    string? ImageUrl,
    int StockQuantity,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
