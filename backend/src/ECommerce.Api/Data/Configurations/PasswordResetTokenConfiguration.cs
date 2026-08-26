using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
    {
        builder.ToTable("PasswordResetTokens");

        builder.HasKey(prt => prt.PasswordResetTokenID);

        builder.Property(prt => prt.PasswordResetTokenID)
            .UseIdentityColumn();

        builder.Property(prt => prt.Token)
            .IsRequired()
            .HasMaxLength(255)
            .IsUnicode(false);

        builder.Property(prt => prt.ExpiresAt)
            .IsRequired();

        builder.Property(prt => prt.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // Unique
        builder.HasIndex(prt => prt.Token)
            .IsUnique()
            .HasDatabaseName("UQ_PasswordResetTokens_Token");

        // FK â†’ Users
        builder.HasOne(prt => prt.User)
            .WithMany(u => u.PasswordResetTokens)
            .HasForeignKey(prt => prt.UserID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_PasswordResetTokens_Users");
    }
}
