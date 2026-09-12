using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.ProductID);

        builder.Property(p => p.ProductID)
            .UseIdentityColumn();

        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(p => p.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasColumnType("nvarchar(max)");

        builder.Property(p => p.Specifications)
            .HasColumnType("nvarchar(max)");

        builder.Property(p => p.Price)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.StockQuantity)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(p => p.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(p => p.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // Unique
        builder.HasIndex(p => p.SKU)
            .IsUnique()
            .HasDatabaseName("UQ_Products_SKU");

        // Check constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint("CK_Products_Price", "[Price] >= 0");
            t.HasCheckConstraint("CK_Products_Stock", "[StockQuantity] >= 0");
        });

        // FK â†’ Categories
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Products_Categories");

        // FK â†’ Brands
        builder.HasOne(p => p.Brand)
            .WithMany(b => b.Products)
            .HasForeignKey(p => p.BrandID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Products_Brands");
    }
}
