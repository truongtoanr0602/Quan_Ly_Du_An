using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        builder.Property(p => p.Price)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        // Price >= 0 constraint
        builder.ToTable(t => t.HasCheckConstraint("CK_Product_Price_Positive", "[Price] >= 0"));

        builder.Property(p => p.Brand)
            .HasMaxLength(100);

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(500);

        builder.Property(p => p.StockQuantity)
            .IsRequired();
            
        // Stock non-negative constraint
        builder.ToTable(t => t.HasCheckConstraint("CK_Product_StockQuantity_NonNegative", "[StockQuantity] >= 0"));

        // Navigation property is configured in CategoryConfiguration
    }
}
