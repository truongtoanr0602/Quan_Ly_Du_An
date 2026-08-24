using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public const int NameMaxLength = 100;

    public const int NameMinLength = 2;

    public const int DescriptionMaxLength = 500;

    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(category => category.Id);

        builder.Property(category => category.Name)
            .IsRequired()
            .HasMaxLength(NameMaxLength)
            .UseCollation(DatabaseCollations.CaseInsensitive);

        builder.Property(category => category.Description)
            .HasMaxLength(DescriptionMaxLength);

        builder.Property(category => category.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2");

        // US-2: category names are unique, case-insensitively. The case-insensitive column collation
        // makes this index enforce the rule at the database level, not only in CategoryService.
        builder.HasIndex(category => category.Name)
            .IsUnique()
            .HasDatabaseName("IX_Categories_Name");

        // US-2: a Category that still has Products must not be deleted.
        builder.HasMany(category => category.Products)
            .WithOne(product => product.Category!)
            .HasForeignKey(product => product.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
