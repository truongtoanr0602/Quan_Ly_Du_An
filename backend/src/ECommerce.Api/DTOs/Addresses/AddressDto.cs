namespace ECommerce.Api.DTOs.Addresses;

public class AddressDto
{
    public int AddressId { get; set; }
    public string ReceiverName { get; set; } = null!;
    public string ReceiverPhone { get; set; } = null!;
    public string? Province { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }
    public string FullAddress { get; set; } = null!;
    public bool IsDefault { get; set; }
}
