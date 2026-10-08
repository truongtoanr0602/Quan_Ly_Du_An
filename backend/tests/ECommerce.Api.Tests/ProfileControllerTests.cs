using System.Net;
using System.Net.Http.Json;
using ECommerce.Api.DTOs.Profile;
using ECommerce.Api.Services.Profile;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Tests;

public sealed class ProfileControllerTests
{
    [Fact]
    public async Task AnonymousCannotReadProfile()
    {
        using var factory = CreateFactory(new RecordingProfileService());
        using var client = factory.CreateClient();

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/profile")).StatusCode);
    }

    [Fact]
    public async Task AdminCannotReadCustomerProfile()
    {
        using var factory = CreateFactory(new RecordingProfileService());
        using var client = factory.CreateClientWithRole("Admin", 17);

        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/profile")).StatusCode);
    }

    [Fact]
    public async Task CustomerIdentityComesFromSubjectClaim()
    {
        var service = new RecordingProfileService();
        using var factory = CreateFactory(service);
        using var client = factory.CreateClientWithRole("Customer", 17);

        using var response = await client.GetAsync("/api/profile");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(17, service.LastUserId);
        var body = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("passwordHash", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("roleID", body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task MissingSubjectClaimReturnsSafeUnauthorized()
    {
        using var factory = CreateFactory(new RecordingProfileService());
        using var client = factory.CreateClientWithRole("Customer");

        using var response = await client.GetAsync("/api/profile");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.DoesNotContain("claim", await response.Content.ReadAsStringAsync(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CustomerCanUpdateOwnProfile()
    {
        var service = new RecordingProfileService();
        using var factory = CreateFactory(service);
        using var client = factory.CreateClientWithRole("Customer", 23);

        using var response = await client.PutAsJsonAsync("/api/profile", new UpdateProfileDto
        {
            FullName = "Updated",
            Phone = "0901"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(23, service.LastUserId);
    }

    private static TestApiFactory CreateFactory(IProfileService service) => new(
        configureTestServices: services =>
        {
            services.AddSingleton(service);
            services.AddSingleton<IProfileService>(service);
        });

    private sealed class RecordingProfileService : IProfileService
    {
        public int LastUserId { get; private set; }

        public Task<ProfileDto> GetAsync(int userId, CancellationToken cancellationToken = default)
        {
            LastUserId = userId;
            return Task.FromResult(new ProfileDto(userId, "customer@example.com", "Customer", null, null));
        }

        public Task<ProfileDto> UpdateAsync(int userId, UpdateProfileDto dto, CancellationToken cancellationToken = default)
        {
            LastUserId = userId;
            return Task.FromResult(new ProfileDto(userId, "customer@example.com", dto.FullName, dto.Phone, dto.AvatarURL));
        }
    }
}
