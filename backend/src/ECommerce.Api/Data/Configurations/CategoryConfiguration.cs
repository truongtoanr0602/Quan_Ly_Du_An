using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(c => c.CategoryID);

        builder.Property(c => c.CategoryID)
            .UseIdentityColumn();

        builder.Property(c => c.CategoryName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(c => c.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // Unique
        builder.HasIndex(c => c.CategoryName)
            .IsUnique()
            .HasDatabaseName("UQ_Categories_Name");

        // Self-referencing FK (parent â†’ child)
        builder.HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Categories_Parent");
    }
}
