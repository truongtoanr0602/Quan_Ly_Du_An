using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages");

        builder.HasKey(pi => pi.ImageID);

        builder.Property(pi => pi.ImageID)
            .UseIdentityColumn();

        builder.Property(pi => pi.ImageURL)
            .IsRequired()
            .HasMaxLength(500)
            .IsUnicode(false);

        builder.Property(pi => pi.IsPrimary)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(pi => pi.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(pi => pi.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // FK â†’ Products
        builder.HasOne(pi => pi.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(pi => pi.ProductID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_ProductImages_Products");
    }
}
