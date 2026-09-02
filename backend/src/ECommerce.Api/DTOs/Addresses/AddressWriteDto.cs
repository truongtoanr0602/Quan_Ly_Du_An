using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Addresses;

public sealed class AddressWriteDto
{
    [Required, StringLength(100)]
    public string ReceiverName { get; init; } = string.Empty;

    [Required, StringLength(20)]
    public string ReceiverPhone { get; init; } = string.Empty;

    [StringLength(100)]
    public string? Province { get; init; }

    [StringLength(100)]
    public string? District { get; init; }

    [StringLength(100)]
    public string? Ward { get; init; }

    [Required, StringLength(500)]
    public string FullAddress { get; init; } = string.Empty;

    public bool IsDefault { get; init; }
}
