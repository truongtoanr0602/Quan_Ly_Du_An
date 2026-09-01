using System.ComponentModel.DataAnnotations;
using ECommerce.Api.Domain;

namespace ECommerce.Api.DTOs.Orders;

public sealed class CheckoutDto
{
    [Range(1, int.MaxValue)]
    public int AddressID { get; init; }

    [Required]
    public string PaymentMethod { get; init; } = OrderConstants.Cod;

    [StringLength(1000)]
    public string? Note { get; init; }
}
