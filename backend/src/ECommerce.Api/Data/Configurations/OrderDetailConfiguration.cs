using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class OrderDetailConfiguration : IEntityTypeConfiguration<OrderDetail>
{
    public void Configure(EntityTypeBuilder<OrderDetail> builder)
    {
        builder.ToTable("OrderDetails");

        builder.HasKey(od => od.OrderDetailID);

        builder.Property(od => od.OrderDetailID)
            .UseIdentityColumn();

        // Snapshot sáº£n pháº©m
        builder.Property(od => od.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(od => od.SKU)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(od => od.Quantity)
            .IsRequired();

        builder.Property(od => od.UnitPrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        // Computed column: TotalPrice = Quantity * UnitPrice
        builder.Property(od => od.TotalPrice)
            .HasColumnType("decimal(18,2)")
            .HasComputedColumnSql("[Quantity] * [UnitPrice]", stored: true);

        // Check constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint("CK_OrderDetails_Quantity", "[Quantity] > 0");
            t.HasCheckConstraint("CK_OrderDetails_UnitPrice", "[UnitPrice] >= 0");
        });

        // FK â†’ Orders
        builder.HasOne(od => od.Order)
            .WithMany(o => o.OrderDetails)
            .HasForeignKey(od => od.OrderID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_OrderDetails_Orders");

        // FK â†’ Products
        builder.HasOne(od => od.Product)
            .WithMany(p => p.OrderDetails)
            .HasForeignKey(od => od.ProductID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_OrderDetails_Products");
    }
}
