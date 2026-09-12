using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Orders;

public class CreateOrderDto
{
    [Required]
    [MaxLength(100)]
    public string ReceiverName { get; set; } = null!;

    [Required]
    [MaxLength(20)]
    public string ReceiverPhone { get; set; } = null!;

    [Required]
    [MaxLength(500)]
    public string ShippingAddress { get; set; } = null!;

    public string? Province { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = "COD";

    public string? Note { get; set; }
}
