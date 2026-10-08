using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Api.Migrations;

public partial class SeedRolesAndBrands : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Existing development databases contain user-managed roles and brands with different IDs.
        // Match by name and let SQL Server allocate IDs so their existing references remain intact.
        migrationBuilder.Sql("""
            IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE UPPER(LTRIM(RTRIM(BrandName))) = N'APPLE')
                INSERT INTO dbo.Brands (BrandName, IsActive, CreatedAt) VALUES (N'Apple', 1, '2026-08-29T00:00:00');
            IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE UPPER(LTRIM(RTRIM(BrandName))) = N'ASUS')
                INSERT INTO dbo.Brands (BrandName, IsActive, CreatedAt) VALUES (N'ASUS', 1, '2026-08-29T00:00:00');
            IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE UPPER(LTRIM(RTRIM(BrandName))) = N'LENOVO')
                INSERT INTO dbo.Brands (BrandName, IsActive, CreatedAt) VALUES (N'Lenovo', 1, '2026-08-29T00:00:00');
            IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE UPPER(LTRIM(RTRIM(BrandName))) = N'DELL')
                INSERT INTO dbo.Brands (BrandName, IsActive, CreatedAt) VALUES (N'Dell', 1, '2026-08-29T00:00:00');
            IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE UPPER(LTRIM(RTRIM(BrandName))) = N'SONY')
                INSERT INTO dbo.Brands (BrandName, IsActive, CreatedAt) VALUES (N'Sony', 1, '2026-08-29T00:00:00');

            IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE UPPER(LTRIM(RTRIM(RoleName))) = N'CUSTOMER')
                INSERT INTO dbo.Roles (RoleName, Description, CreatedAt) VALUES (N'Customer', N'Customer role', '2026-08-29T00:00:00');
            IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE UPPER(LTRIM(RTRIM(RoleName))) = N'ADMIN')
                INSERT INTO dbo.Roles (RoleName, Description, CreatedAt) VALUES (N'Admin', N'Administrator role', '2026-08-29T00:00:00');
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Seed rows may predate this migration and may be referenced by users or products.
        // A rollback must not delete user-managed data.
    }
}
