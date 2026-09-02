namespace ECommerce.Api.DTOs.Orders;

public sealed record OrderSummaryDto(
    long OrderID,
    decimal TotalAmount,
    string PaymentMethod,
    string PaymentStatus,
    string OrderStatus,
    DateTime CreatedAt,
    int TotalItems);
