using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.ToTable("Addresses");

        builder.HasKey(a => a.AddressID);

        builder.Property(a => a.AddressID)
            .UseIdentityColumn();

        builder.Property(a => a.ReceiverName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.ReceiverPhone)
            .IsRequired()
            .HasMaxLength(20)
            .IsUnicode(false);

        builder.Property(a => a.Province)
            .HasMaxLength(100);

        builder.Property(a => a.District)
            .HasMaxLength(100);

        builder.Property(a => a.Ward)
            .HasMaxLength(100);

        builder.Property(a => a.FullAddress)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.IsDefault)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(a => a.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIME()");

        // FK â†’ Users
        builder.HasOne(a => a.User)
            .WithMany(u => u.Addresses)
            .HasForeignKey(a => a.UserID)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Addresses_Users");
    }
}
