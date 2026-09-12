using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Addresses;

public class AddressCreateDto
{
    [Required]
    [MaxLength(100)]
    public string ReceiverName { get; set; } = null!;

    [Required]
    [MaxLength(20)]
    public string ReceiverPhone { get; set; } = null!;

    [MaxLength(100)]
    public string? Province { get; set; }

    [MaxLength(100)]
    public string? District { get; set; }

    [MaxLength(100)]
    public string? Ward { get; set; }

    [Required]
    [MaxLength(500)]
    public string FullAddress { get; set; } = null!;

    public bool IsDefault { get; set; }
}
