using System.Net;
using System.Net.Http.Json;
using ECommerce.Api.DTOs.Addresses;
using ECommerce.Api.Services.Addresses;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Tests;

public sealed class AddressesControllerTests
{
    [Fact]
    public async Task AnonymousAndAdminCannotAccessCustomerAddresses()
    {
        using var factory = CreateFactory(new RecordingAddressService());
        using var anonymous = factory.CreateClient();
        using var admin = factory.CreateClientWithRole("Admin", 1);

        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/addresses")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await admin.GetAsync("/api/addresses")).StatusCode);
    }

    [Fact]
    public async Task CustomerIdentityComesFromJwtForCrud()
    {
        var service = new RecordingAddressService();
        using var factory = CreateFactory(service);
        using var client = factory.CreateClientWithRole("Customer", 42);
        var request = new AddressWriteDto
        {
            ReceiverName = "Customer",
            ReceiverPhone = "0900000000",
            FullAddress = "1 Test Street"
        };

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/addresses")).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await client.PostAsJsonAsync("/api/addresses", request)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PutAsJsonAsync("/api/addresses/5", request)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/api/addresses/5")).StatusCode);
        Assert.All(service.UserIds, id => Assert.Equal(42, id));
    }

    private static TestApiFactory CreateFactory(IAddressService service) => new(
        configureTestServices: services =>
        {
            services.AddSingleton(service);
            services.AddSingleton<IAddressService>(service);
        });

    private sealed class RecordingAddressService : IAddressService
    {
        private static readonly AddressDto Address = new(5, "Customer", "0900000000", null, null, null, "1 Test Street", true);
        public List<int> UserIds { get; } = [];

        public Task<IReadOnlyList<AddressDto>> ListAsync(int userId, CancellationToken ct = default)
        {
            UserIds.Add(userId);
            return Task.FromResult<IReadOnlyList<AddressDto>>([Address]);
        }

        public Task<AddressDto> CreateAsync(int userId, AddressWriteDto dto, CancellationToken ct = default)
        {
            UserIds.Add(userId);
            return Task.FromResult(Address);
        }

        public Task<AddressDto> UpdateAsync(int userId, int addressId, AddressWriteDto dto, CancellationToken ct = default)
        {
            UserIds.Add(userId);
            return Task.FromResult(Address);
        }

        public Task DeleteAsync(int userId, int addressId, CancellationToken ct = default)
        {
            UserIds.Add(userId);
            return Task.CompletedTask;
        }
    }
}
