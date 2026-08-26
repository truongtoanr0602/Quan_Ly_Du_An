using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.UserID);

        builder.Property(u => u.UserID)
            .UseIdentityColumn();

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(150)
            .IsUnicode(false);

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(255)
            .IsUnicode(false);

        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.Phone)
            .HasMaxLength(20)
            .IsUnicode(false);

        builder.Property(u => u.AvatarURL)
            .HasMaxLength(500)
            .IsUnicode(false);

        builder.Property(u => u.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(u => u.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // Unique
        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("UQ_Users_Email");

        // FK â†’ Roles
        builder.HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Users_Roles");
    }
}
