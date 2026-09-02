namespace ECommerce.Api.DTOs.Cart;

public sealed record CartDto(
    IReadOnlyList<CartItemDto> Items,
    int TotalItems,
    decimal TotalAmount);
