using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.OrderID);

        builder.Property(o => o.OrderID)
            .UseIdentityColumn();

        // Snapshot thÃ´ng tin giao hÃ ng
        builder.Property(o => o.ReceiverName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(o => o.ReceiverPhone)
            .IsRequired()
            .HasMaxLength(20)
            .IsUnicode(false);

        builder.Property(o => o.Province)
            .HasMaxLength(100);

        builder.Property(o => o.District)
            .HasMaxLength(100);

        builder.Property(o => o.Ward)
            .HasMaxLength(100);

        builder.Property(o => o.ShippingAddress)
            .IsRequired()
            .HasMaxLength(500);

        // Tiá»n
        builder.Property(o => o.SubTotal)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(o => o.ShippingFee)
            .IsRequired()
            .HasColumnType("decimal(18,2)")
            .HasDefaultValue(0m);

        builder.Property(o => o.TotalAmount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        // Status & Payment
        builder.Property(o => o.PaymentMethod)
            .IsRequired()
            .HasMaxLength(30)
            .IsUnicode(false)
            .HasDefaultValue("COD");

        builder.Property(o => o.PaymentStatus)
            .IsRequired()
            .HasMaxLength(30)
            .IsUnicode(false)
            .HasDefaultValue("PENDING");

        builder.Property(o => o.OrderStatus)
            .IsRequired()
            .HasMaxLength(30)
            .IsUnicode(false)
            .HasDefaultValue("PENDING");

        builder.Property(o => o.Note)
            .HasMaxLength(1000);

        builder.Property(o => o.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // Check constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint("CK_Orders_PaymentMethod",
                "[PaymentMethod] = 'COD'");

            t.HasCheckConstraint("CK_Orders_PaymentStatus",
                "[PaymentStatus] IN ('PENDING','PAID','FAILED')");

            t.HasCheckConstraint("CK_Orders_OrderStatus",
                "[OrderStatus] IN ('PENDING','CONFIRMED','SHIPPING','COMPLETED','CANCELLED')");

            t.HasCheckConstraint("CK_Orders_SubTotal",
                "[SubTotal] >= 0");

            t.HasCheckConstraint("CK_Orders_ShippingFee",
                "[ShippingFee] >= 0");

            t.HasCheckConstraint("CK_Orders_TotalAmount",
                "[TotalAmount] >= 0");
        });

        // FK â†’ Users
        builder.HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Orders_Users");
    }
}
