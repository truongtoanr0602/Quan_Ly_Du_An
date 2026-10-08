using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Cart;

public sealed class UpdateCartItemDto
{
    [Range(1, int.MaxValue)]
    public int Quantity { get; init; }
}
