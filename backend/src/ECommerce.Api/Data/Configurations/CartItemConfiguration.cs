using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("CartItems");

        builder.HasKey(ci => ci.CartItemID);

        builder.Property(ci => ci.CartItemID)
            .UseIdentityColumn();

        builder.Property(ci => ci.Quantity)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(ci => ci.AddedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // Unique composite â€” má»—i sáº£n pháº©m chá»‰ xuáº¥t hiá»‡n 1 láº§n trong 1 giá»
        builder.HasIndex(ci => new { ci.CartID, ci.ProductID })
            .IsUnique()
            .HasDatabaseName("UQ_CartItems_Cart_Product");

        // Check constraint
        builder.ToTable(t =>
        {
            t.HasCheckConstraint("CK_CartItems_Quantity", "[Quantity] > 0");
        });

        // FK â†’ Carts
        builder.HasOne(ci => ci.Cart)
            .WithMany(c => c.Items)
            .HasForeignKey(ci => ci.CartID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_CartItems_Carts");

        // FK â†’ Products
        builder.HasOne(ci => ci.Product)
            .WithMany(p => p.CartItems)
            .HasForeignKey(ci => ci.ProductID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_CartItems_Products");
    }
}
