namespace ECommerce.Api.DTOs.Addresses;

public sealed record AddressDto(
    int AddressID,
    string ReceiverName,
    string ReceiverPhone,
    string? Province,
    string? District,
    string? Ward,
    string FullAddress,
    bool IsDefault);
