using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Cart;

public sealed class AddCartItemDto
{
    [Range(1, int.MaxValue)]
    public int ProductID { get; init; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; init; }
}
