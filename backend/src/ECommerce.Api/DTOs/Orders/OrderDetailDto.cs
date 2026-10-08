namespace ECommerce.Api.DTOs.Orders;

public sealed record OrderDetailDto(
    long OrderID,
    int UserID,
    string ReceiverName,
    string ReceiverPhone,
    string? Province,
    string? District,
    string? Ward,
    string ShippingAddress,
    decimal SubTotal,
    decimal ShippingFee,
    decimal TotalAmount,
    string PaymentMethod,
    string PaymentStatus,
    string OrderStatus,
    string? Note,
    DateTime CreatedAt,
    IReadOnlyList<OrderItemDto> Items);
