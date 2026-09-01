using ECommerce.Api.Data;
using System.Data;
using ECommerce.Api.DTOs.Addresses;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Addresses;

public sealed class AddressService(AppDbContext context) : IAddressService
{
    public async Task<IReadOnlyList<AddressDto>> ListAsync(int userId, CancellationToken ct = default)
    {
        return await context.Addresses
            .AsNoTracking()
            .Where(address => address.UserID == userId)
            .OrderByDescending(address => address.IsDefault)
            .ThenByDescending(address => address.CreatedAt)
            .Select(address => ToDto(address))
            .ToArrayAsync(ct);
    }

    public async Task<AddressDto> CreateAsync(int userId, AddressWriteDto dto, CancellationToken ct = default)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var hasAddress = await context.Addresses.AnyAsync(address => address.UserID == userId, ct);
        var makeDefault = dto.IsDefault || !hasAddress;
        if (makeDefault) await ClearDefaultsAsync(userId, null, ct);

        var address = new Address
        {
            UserID = userId,
            ReceiverName = Required(dto.ReceiverName),
            ReceiverPhone = Required(dto.ReceiverPhone),
            Province = Optional(dto.Province),
            District = Optional(dto.District),
            Ward = Optional(dto.Ward),
            FullAddress = Required(dto.FullAddress),
            IsDefault = makeDefault,
            CreatedAt = DateTime.UtcNow
        };
        context.Addresses.Add(address);
        await context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return ToDto(address);
    }

    public async Task<AddressDto> UpdateAsync(
        int userId,
        int addressId,
        AddressWriteDto dto,
        CancellationToken ct = default)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var address = await context.Addresses
            .SingleOrDefaultAsync(candidate => candidate.AddressID == addressId && candidate.UserID == userId, ct)
            ?? throw new ResourceNotFoundException();

        if (dto.IsDefault) await ClearDefaultsAsync(userId, addressId, ct);
        address.ReceiverName = Required(dto.ReceiverName);
        address.ReceiverPhone = Required(dto.ReceiverPhone);
        address.Province = Optional(dto.Province);
        address.District = Optional(dto.District);
        address.Ward = Optional(dto.Ward);
        address.FullAddress = Required(dto.FullAddress);
        address.IsDefault = dto.IsDefault;
        await context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return ToDto(address);
    }

    public async Task DeleteAsync(int userId, int addressId, CancellationToken ct = default)
    {
        var address = await context.Addresses
            .SingleOrDefaultAsync(candidate => candidate.AddressID == addressId && candidate.UserID == userId, ct)
            ?? throw new ResourceNotFoundException();

        context.Addresses.Remove(address);
        await context.SaveChangesAsync(ct);
    }

    private async Task ClearDefaultsAsync(int userId, int? exceptAddressId, CancellationToken ct)
    {
        var defaults = await context.Addresses
            .Where(address => address.UserID == userId
                && address.IsDefault
                && (!exceptAddressId.HasValue || address.AddressID != exceptAddressId.Value))
            .ToArrayAsync(ct);
        foreach (var address in defaults) address.IsDefault = false;
    }

    private static string Required(string value)
    {
        var normalized = value.Trim();
        if (normalized.Length == 0) throw new DomainValidationException();
        return normalized;
    }

    private static string? Optional(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrEmpty(normalized) ? null : normalized;
    }

    private static AddressDto ToDto(Address address) => new(
        address.AddressID,
        address.ReceiverName,
        address.ReceiverPhone,
        address.Province,
        address.District,
        address.Ward,
        address.FullAddress,
        address.IsDefault);
}
