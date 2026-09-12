using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace ECommerce.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // ─── Auth & Users ────────────────────────────────────────
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    // ─── Profile ─────────────────────────────────────────────
    public DbSet<Address> Addresses => Set<Address>();

    // ─── Catalog ─────────────────────────────────────────────
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();

    // ─── Cart ────────────────────────────────────────────────
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    // ─── Orders ──────────────────────────────────────────────
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderDetail> OrderDetails => Set<OrderDetail>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entityEntry in entries)
        {
            // Set CreatedAt khi thêm mới
            if (entityEntry.State == EntityState.Added)
            {
                var createdAtProp = entityEntry.Properties
                    .FirstOrDefault(p => p.Metadata.Name == "CreatedAt");
                if (createdAtProp != null && createdAtProp.CurrentValue is DateTime dt && dt == default)
                {
                    createdAtProp.CurrentValue = DateTime.UtcNow;
                }
            }

            // Set UpdatedAt khi cập nhật
            if (entityEntry.State == EntityState.Modified)
            {
                var updatedAtProp = entityEntry.Properties
                    .FirstOrDefault(p => p.Metadata.Name == "UpdatedAt");
                if (updatedAtProp != null)
                {
                    updatedAtProp.CurrentValue = DateTime.UtcNow;
                }
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
