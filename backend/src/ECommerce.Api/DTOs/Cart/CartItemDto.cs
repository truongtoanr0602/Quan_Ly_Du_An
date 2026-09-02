namespace ECommerce.Api.DTOs.Cart;

public sealed record CartItemDto(
    int ProductID,
    string ProductName,
    string SKU,
    decimal UnitPrice,
    int Quantity,
    int StockQuantity,
    string? ImageURL,
    decimal LineTotal);
