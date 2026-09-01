using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Addresses;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using ECommerce.Api.Services.Addresses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ECommerce.Api.Tests;

public sealed class AddressServiceTests
{
    [Fact]
    public async Task FirstAddressBecomesDefaultAndListIsCustomerOwned()
    {
        await using var fixture = AddressFixture.Create();

        var created = await fixture.Service.CreateAsync(7, Write("First", false));
        await fixture.Service.CreateAsync(8, Write("Other customer", false));
        var addresses = await fixture.Service.ListAsync(7);

        Assert.True(created.IsDefault);
        Assert.Single(addresses);
        Assert.Equal("First", addresses[0].ReceiverName);
    }

    [Fact]
    public async Task SettingDefaultClearsPreviousDefault()
    {
        await using var fixture = AddressFixture.Create();
        var first = await fixture.Service.CreateAsync(7, Write("First", true));
        var second = await fixture.Service.CreateAsync(7, Write("Second", false));

        var updated = await fixture.Service.UpdateAsync(7, second.AddressID, Write("Second", true));
        var addresses = await fixture.Service.ListAsync(7);

        Assert.True(updated.IsDefault);
        Assert.False(addresses.Single(x => x.AddressID == first.AddressID).IsDefault);
        Assert.Single(addresses, x => x.IsDefault);
    }

    [Fact]
    public async Task CustomerCannotUpdateOrDeleteAnotherCustomersAddress()
    {
        await using var fixture = AddressFixture.Create();
        var address = await fixture.Service.CreateAsync(8, Write("Private", false));

        await Assert.ThrowsAsync<ResourceNotFoundException>(() =>
            fixture.Service.UpdateAsync(7, address.AddressID, Write("Changed", false)));
        await Assert.ThrowsAsync<ResourceNotFoundException>(() =>
            fixture.Service.DeleteAsync(7, address.AddressID));
    }

    [Fact]
    public async Task DeleteRemovesOwnedAddress()
    {
        await using var fixture = AddressFixture.Create();
        var address = await fixture.Service.CreateAsync(7, Write("Delete me", false));

        await fixture.Service.DeleteAsync(7, address.AddressID);

        Assert.Empty(await fixture.Service.ListAsync(7));
    }

    private static AddressWriteDto Write(string name, bool isDefault) => new()
    {
        ReceiverName = name,
        ReceiverPhone = "0900000000",
        Province = "Ho Chi Minh",
        District = "District 1",
        Ward = "Ward 1",
        FullAddress = "1 Test Street",
        IsDefault = isDefault
    };

    private sealed class AddressFixture : IAsyncDisposable
    {
        public AppDbContext Context { get; }
        public AddressService Service { get; }

        private AddressFixture(AppDbContext context)
        {
            Context = context;
            Service = new AddressService(context);
        }

        public static AddressFixture Create()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .ConfigureWarnings(builder => builder.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;
            return new AddressFixture(new AppDbContext(options));
        }

        public ValueTask DisposeAsync() => Context.DisposeAsync();
    }
}
