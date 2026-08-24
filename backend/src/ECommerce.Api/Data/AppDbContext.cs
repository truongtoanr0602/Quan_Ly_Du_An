using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace ECommerce.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
    
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.Entity is Category || e.Entity is Product);

        foreach (var entityEntry in entries)
        {
            if (entityEntry.State == EntityState.Added)
            {
                if (entityEntry.Entity is Category category)
                {
                    category.CreatedAt = DateTime.UtcNow;
                }
                else if (entityEntry.Entity is Product product)
                {
                    product.CreatedAt = DateTime.UtcNow;
                }
            }
            else if (entityEntry.State == EntityState.Modified)
            {
                if (entityEntry.Entity is Product product)
                {
                    product.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
