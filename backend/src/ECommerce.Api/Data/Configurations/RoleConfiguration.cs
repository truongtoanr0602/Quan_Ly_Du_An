using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");

        builder.HasKey(r => r.RoleID);

        builder.Property(r => r.RoleID)
            .UseIdentityColumn();

        builder.Property(r => r.RoleName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.Description)
            .HasMaxLength(255);

        builder.Property(r => r.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // Unique
        builder.HasIndex(r => r.RoleName)
            .IsUnique()
            .HasDatabaseName("UQ_Roles_RoleName");
        var seedTimestamp = new DateTime(2026, 8, 29, 0, 0, 0, DateTimeKind.Utc);

        builder.HasData(
            new Role { RoleID = 1, RoleName = "Customer", Description = "Customer role", CreatedAt = seedTimestamp },
            new Role { RoleID = 2, RoleName = "Admin", Description = "Administrator role", CreatedAt = seedTimestamp });
    }
}
