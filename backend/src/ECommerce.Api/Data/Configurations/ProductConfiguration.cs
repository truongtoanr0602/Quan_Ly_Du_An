using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

/// <summary>
/// Persistence mapping only. Product API behavior belongs to US-3.
/// </summary>
public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products", table =>
        {
            table.HasCheckConstraint("CK_Products_Price_NonNegative", "[Price] >= 0");
            table.HasCheckConstraint("CK_Products_StockQuantity_NonNegative", "[StockQuantity] >= 0");
        });

        builder.HasKey(product => product.Id);

        builder.Property(product => product.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(product => product.Description)
            .HasMaxLength(2000);

        builder.Property(product => product.Price)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(product => product.Brand)
            .HasMaxLength(100);

        builder.Property(product => product.ImageUrl)
            .HasMaxLength(500);

        builder.Property(product => product.StockQuantity)
            .IsRequired();

        builder.Property(product => product.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2");

        builder.Property(product => product.UpdatedAt)
            .HasColumnType("datetime2");

        builder.HasIndex(product => product.CategoryId)
            .HasDatabaseName("IX_Products_CategoryId");
    }
}
