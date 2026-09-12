using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class OrderStatusHistoryConfiguration : IEntityTypeConfiguration<OrderStatusHistory>
{
    public void Configure(EntityTypeBuilder<OrderStatusHistory> builder)
    {
        builder.ToTable("OrderStatusHistory");

        builder.HasKey(h => h.HistoryID);

        builder.Property(h => h.HistoryID)
            .UseIdentityColumn();

        builder.Property(h => h.OldStatus)
            .HasMaxLength(30)
            .IsUnicode(false);

        builder.Property(h => h.NewStatus)
            .IsRequired()
            .HasMaxLength(30)
            .IsUnicode(false);

        builder.Property(h => h.Note)
            .HasMaxLength(500);

        builder.Property(h => h.ChangedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // FK â†’ Orders
        builder.HasOne(h => h.Order)
            .WithMany(o => o.StatusHistories)
            .HasForeignKey(h => h.OrderID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_OrderHistory_Orders");

        // FK â†’ Users (ChangedBy)
        builder.HasOne(h => h.ChangedByUser)
            .WithMany()
            .HasForeignKey(h => h.ChangedBy)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_OrderHistory_User");
    }
}
