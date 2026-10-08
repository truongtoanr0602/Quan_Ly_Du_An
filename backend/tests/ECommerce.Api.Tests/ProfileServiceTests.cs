using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Profile;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using ECommerce.Api.Services.Profile;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Tests;

public sealed class ProfileServiceTests
{
    [Fact]
    public async Task GetReturnsOnlyPublicProfileFields()
    {
        await using var fixture = await ProfileFixture.CreateAsync();

        var profile = await fixture.Service.GetAsync(fixture.UserId);

        Assert.Equal(fixture.UserId, profile.UserID);
        Assert.Equal("customer@example.com", profile.Email);
        Assert.Equal("Customer One", profile.FullName);
        Assert.Equal("0900000000", profile.Phone);
        Assert.Equal("https://example.com/avatar.png", profile.AvatarURL);
    }

    [Fact]
    public async Task UpdateChangesOnlyEditableProfileFields()
    {
        await using var fixture = await ProfileFixture.CreateAsync();

        var profile = await fixture.Service.UpdateAsync(fixture.UserId, new UpdateProfileDto
        {
            FullName = "  Updated Customer  ",
            Phone = " 0911111111 ",
            AvatarURL = " https://example.com/new.png "
        });

        var user = await fixture.Context.Users.SingleAsync(x => x.UserID == fixture.UserId);
        Assert.Equal("Updated Customer", profile.FullName);
        Assert.Equal("0911111111", user.Phone);
        Assert.Equal("https://example.com/new.png", user.AvatarURL);
        Assert.Equal("customer@example.com", user.Email);
        Assert.Equal("hash-never-returned", user.PasswordHash);
        Assert.Equal(1, user.RoleID);
    }

    [Fact]
    public async Task MissingProfileIsNotExposed()
    {
        await using var fixture = await ProfileFixture.CreateAsync();

        await Assert.ThrowsAsync<ResourceNotFoundException>(() => fixture.Service.GetAsync(999));
    }

    private sealed class ProfileFixture : IAsyncDisposable
    {
        public AppDbContext Context { get; }
        public ProfileService Service { get; }
        public int UserId { get; private set; }

        private ProfileFixture(AppDbContext context)
        {
            Context = context;
            Service = new ProfileService(context);
        }

        public static async Task<ProfileFixture> CreateAsync()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            var context = new AppDbContext(options);

            var role = new Role { RoleName = "Customer", CreatedAt = DateTime.UtcNow };
            var user = new User
            {
                Role = role,
                Email = "customer@example.com",
                PasswordHash = "hash-never-returned",
                FullName = "Customer One",
                Phone = "0900000000",
                AvatarURL = "https://example.com/avatar.png",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Add(user);
            await context.SaveChangesAsync();

            return new ProfileFixture(context) { UserId = user.UserID };
        }

        public async ValueTask DisposeAsync()
        {
            await Context.DisposeAsync();
        }
    }
}
