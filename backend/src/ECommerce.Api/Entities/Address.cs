namespace ECommerce.Api.Entities;


public class Address
{
    public int AddressID { get; set; }

    public int UserID { get; set; }

    public string ReceiverName { get; set; } = null!;

    public string ReceiverPhone { get; set; } = null!;

    public string? Province { get; set; }

    public string? District { get; set; }

    public string? Ward { get; set; }

    public string FullAddress { get; set; } = null!;

    public bool IsDefault { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
