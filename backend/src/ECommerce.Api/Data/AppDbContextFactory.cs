using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ECommerce.Api.Data;

/// <summary>
/// Design-time factory used by `dotnet ef`. It keeps migration tooling independent of application
/// startup so no JWT signing key or SQL credential is required to scaffold a migration.
/// </summary>
public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    private const string DesignTimeFallbackConnectionString =
        "Server=(localdb)\\MSSQLLocalDB;Database=ECommerce;Trusted_Connection=True;TrustServerCertificate=True";

    public AppDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddUserSecrets<AppDbContextFactory>(optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("ECommerce");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = DesignTimeFallbackConnectionString;
        }

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new AppDbContext(options);
    }
}
