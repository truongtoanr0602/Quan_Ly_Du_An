namespace ECommerce.Api.DTOs.Admin;

public class UserListDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string? Phone { get; set; }
    public string Role { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int OrderCount { get; set; }
}

public class AdminOrderDto
{
    public long OrderId { get; set; }
    public int UserId { get; set; }
    public string CustomerName { get; set; } = null!;
    public string CustomerEmail { get; set; } = null!;
    public string ReceiverName { get; set; } = null!;
    public string ReceiverPhone { get; set; } = null!;
    public string ShippingAddress { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = null!;
    public string PaymentStatus { get; set; } = null!;
    public string OrderStatus { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<AdminOrderDetailDto> Items { get; set; } = [];
}

public class AdminOrderDetailDto
{
    public long OrderDetailId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string Sku { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
