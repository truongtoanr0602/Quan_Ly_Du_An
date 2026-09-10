using ECommerce.Api.DTOs.Addresses;

namespace ECommerce.Api.Services.Addresses;

public interface IAddressService
{
    Task<List<AddressDto>> GetUserAddressesAsync(int userId, CancellationToken cancellationToken = default);
    Task<AddressDto> GetByIdAsync(int userId, int addressId, CancellationToken cancellationToken = default);
    Task<AddressDto> CreateAsync(int userId, AddressCreateDto dto, CancellationToken cancellationToken = default);
    Task<AddressDto> UpdateAsync(int userId, int addressId, AddressUpdateDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int userId, int addressId, CancellationToken cancellationToken = default);
}
