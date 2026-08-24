using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

/// <summary>
/// Minimum persistence mapping required by JWT authentication and Admin/Customer authorization.
/// Registration and login behavior belong to US-7 and US-8.
/// </summary>
public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users", table =>
            table.HasCheckConstraint("CK_Users_Role", "[Role] IN ('Admin', 'Customer')"));

        builder.HasKey(user => user.Id);

        builder.Property(user => user.FullName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(user => user.Email)
            .IsRequired()
            .HasMaxLength(256)
            .UseCollation(DatabaseCollations.CaseInsensitive);

        builder.Property(user => user.PasswordHash)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(user => user.Role)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(user => user.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2");

        builder.HasIndex(user => user.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email");
    }
}
