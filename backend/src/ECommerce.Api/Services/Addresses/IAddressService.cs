using ECommerce.Api.DTOs.Addresses;

namespace ECommerce.Api.Services.Addresses;

public interface IAddressService
{
    Task<IReadOnlyList<AddressDto>> ListAsync(int userId, CancellationToken ct = default);
    Task<AddressDto> CreateAsync(int userId, AddressWriteDto dto, CancellationToken ct = default);
    Task<AddressDto> UpdateAsync(int userId, int addressId, AddressWriteDto dto, CancellationToken ct = default);
    Task DeleteAsync(int userId, int addressId, CancellationToken ct = default);
}
