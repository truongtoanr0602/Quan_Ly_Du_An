using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.ToTable("Brands");

        builder.HasKey(b => b.BrandID);

        builder.Property(b => b.BrandID)
            .UseIdentityColumn();

        builder.Property(b => b.BrandName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.Description)
            .HasMaxLength(500);

        builder.Property(b => b.LogoURL)
            .HasMaxLength(500)
            .IsUnicode(false);

        builder.Property(b => b.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(b => b.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // Unique
        builder.HasIndex(b => b.BrandName)
            .IsUnique()
            .HasDatabaseName("UQ_Brands_Name");
        var seedTimestamp = new DateTime(2026, 8, 29, 0, 0, 0, DateTimeKind.Utc);

        builder.HasData(
            new Brand { BrandID = 1, BrandName = "Apple", IsActive = true, CreatedAt = seedTimestamp },
            new Brand { BrandID = 2, BrandName = "ASUS", IsActive = true, CreatedAt = seedTimestamp },
            new Brand { BrandID = 3, BrandName = "Lenovo", IsActive = true, CreatedAt = seedTimestamp },
            new Brand { BrandID = 4, BrandName = "Dell", IsActive = true, CreatedAt = seedTimestamp },
            new Brand { BrandID = 5, BrandName = "Sony", IsActive = true, CreatedAt = seedTimestamp });
    }
}
