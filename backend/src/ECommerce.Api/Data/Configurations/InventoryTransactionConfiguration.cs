using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class InventoryTransactionConfiguration : IEntityTypeConfiguration<InventoryTransaction>
{
    public void Configure(EntityTypeBuilder<InventoryTransaction> builder)
    {
        builder.ToTable("InventoryTransactions");

        builder.HasKey(it => it.InventoryTransactionID);

        builder.Property(it => it.InventoryTransactionID)
            .UseIdentityColumn();

        builder.Property(it => it.TransactionType)
            .IsRequired()
            .HasMaxLength(30)
            .IsUnicode(false);

        builder.Property(it => it.Quantity)
            .IsRequired();

        builder.Property(it => it.PreviousStock)
            .IsRequired();

        builder.Property(it => it.NewStock)
            .IsRequired();

        builder.Property(it => it.Note)
            .HasMaxLength(500);

        builder.Property(it => it.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // Check constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint("CK_Inventory_Type",
                "[TransactionType] IN ('IMPORT','SALE','RETURN','ADJUSTMENT','CANCEL_ORDER')");
            t.HasCheckConstraint("CK_Inventory_NewStock",
                "[NewStock] >= 0");
        });

        // FK â†’ Products
        builder.HasOne(it => it.Product)
            .WithMany(p => p.InventoryTransactions)
            .HasForeignKey(it => it.ProductID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Inventory_Product");

        // FK â†’ Users (CreatedBy)
        builder.HasOne(it => it.CreatedByUser)
            .WithMany()
            .HasForeignKey(it => it.CreatedBy)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Inventory_User");
    }
}
