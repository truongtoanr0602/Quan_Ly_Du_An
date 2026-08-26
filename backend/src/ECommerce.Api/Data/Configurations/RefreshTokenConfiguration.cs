using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");

        builder.HasKey(rt => rt.RefreshTokenID);

        builder.Property(rt => rt.RefreshTokenID)
            .UseIdentityColumn();

        builder.Property(rt => rt.Token)
            .IsRequired()
            .HasMaxLength(500)
            .IsUnicode(false);

        builder.Property(rt => rt.ExpiresAt)
            .IsRequired();

        builder.Property(rt => rt.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // Unique
        builder.HasIndex(rt => rt.Token)
            .IsUnique()
            .HasDatabaseName("UQ_RefreshTokens_Token");

        // FK â†’ Users
        builder.HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_RefreshTokens_Users");
    }
}
