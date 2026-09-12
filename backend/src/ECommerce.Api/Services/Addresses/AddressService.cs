using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Addresses;
using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Addresses;

public class AddressService : IAddressService
{
    private readonly AppDbContext _context;

    public AddressService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AddressDto>> GetUserAddressesAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _context.Addresses
            .Where(a => a.UserID == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .Select(a => MapToDto(a))
            .ToListAsync(cancellationToken);
    }

    public async Task<AddressDto> GetByIdAsync(int userId, int addressId, CancellationToken cancellationToken = default)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.AddressID == addressId && a.UserID == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Address not found.");

        return MapToDto(address);
    }

    public async Task<AddressDto> CreateAsync(int userId, AddressCreateDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.IsDefault)
        {
            await ClearDefaultAsync(userId, cancellationToken);
        }

        var address = new Address
        {
            UserID = userId,
            ReceiverName = dto.ReceiverName,
            ReceiverPhone = dto.ReceiverPhone,
            Province = dto.Province,
            District = dto.District,
            Ward = dto.Ward,
            FullAddress = dto.FullAddress,
            IsDefault = dto.IsDefault,
            CreatedAt = DateTime.UtcNow
        };

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(address);
    }

    public async Task<AddressDto> UpdateAsync(int userId, int addressId, AddressUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.AddressID == addressId && a.UserID == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Address not found.");

        if (dto.IsDefault && !address.IsDefault)
        {
            await ClearDefaultAsync(userId, cancellationToken);
        }

        address.ReceiverName = dto.ReceiverName;
        address.ReceiverPhone = dto.ReceiverPhone;
        address.Province = dto.Province;
        address.District = dto.District;
        address.Ward = dto.Ward;
        address.FullAddress = dto.FullAddress;
        address.IsDefault = dto.IsDefault;
        address.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(address);
    }

    public async Task DeleteAsync(int userId, int addressId, CancellationToken cancellationToken = default)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.AddressID == addressId && a.UserID == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Address not found.");

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task ClearDefaultAsync(int userId, CancellationToken cancellationToken)
    {
        var defaults = await _context.Addresses
            .Where(a => a.UserID == userId && a.IsDefault)
            .ToListAsync(cancellationToken);

        foreach (var addr in defaults)
        {
            addr.IsDefault = false;
        }
    }

    private static AddressDto MapToDto(Address a) => new()
    {
        AddressId = a.AddressID,
        ReceiverName = a.ReceiverName,
        ReceiverPhone = a.ReceiverPhone,
        Province = a.Province,
        District = a.District,
        Ward = a.Ward,
        FullAddress = a.FullAddress,
        IsDefault = a.IsDefault
    };
}
