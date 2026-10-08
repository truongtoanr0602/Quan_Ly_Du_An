using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Carts;

public class AddCartItemDto
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; } = 1;
}
