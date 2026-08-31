using ECommerce.Api.Configuration;
using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Data;

public sealed class DevelopmentAdminBootstrapper(AppDbContext context, BootstrapAdminOptions options)
{
    private readonly AppDbContext _context = context;
    private readonly BootstrapAdminOptions _options = options;

    public async Task EnsureCreatedAsync(CancellationToken cancellationToken)
    {
        if (_options.IsPartiallyConfigured)
        {
            throw new InvalidOperationException(
                "BootstrapAdmin configuration must provide Email, Password, and FullName together.");
        }

        if (!_options.IsConfigured)
        {
            return;
        }

        var existingEmail = await _context.Users
            .Include(user => user.Role)
            .FirstOrDefaultAsync(user => user.Email == _options.Email, cancellationToken);

        if (existingEmail is not null)
        {
            if (existingEmail.Role.RoleName == "Admin")
            {
                return;
            }

            throw new InvalidOperationException(
                "BootstrapAdmin email is already assigned to a non-admin account.");
        }

        var existingAdmin = await _context.Users
            .Include(user => user.Role)
            .AnyAsync(user => user.Role.RoleName == "Admin", cancellationToken);

        if (existingAdmin)
        {
            return;
        }

        var adminRole = await _context.Roles
            .SingleAsync(role => role.RoleName == "Admin", cancellationToken);

        _context.Users.Add(new User
        {
            Email = _options.Email!,
            FullName = _options.FullName!,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(_options.Password!),
            RoleID = adminRole.RoleID,
            IsActive = true
        });

        await _context.SaveChangesAsync(cancellationToken);
    }
}

public sealed class DevelopmentAdminBootstrapHostedService(
    IServiceScopeFactory scopeFactory,
    IHostApplicationLifetime applicationLifetime,
    ILogger<DevelopmentAdminBootstrapHostedService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            var applicationStarted = new TaskCompletionSource(
                TaskCreationOptions.RunContinuationsAsynchronously);
            using var registration = applicationLifetime.ApplicationStarted.Register(
                static state => ((TaskCompletionSource)state!).TrySetResult(), applicationStarted);
            if (applicationLifetime.ApplicationStarted.IsCancellationRequested)
            {
                applicationStarted.TrySetResult();
            }

            await applicationStarted.Task.WaitAsync(stoppingToken);

            await using var scope = scopeFactory.CreateAsyncScope();
            var bootstrapper = scope.ServiceProvider.GetRequiredService<DevelopmentAdminBootstrapper>();
            await bootstrapper.EnsureCreatedAsync(stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Development Admin bootstrap failed.");
            throw;
        }
    }
}
