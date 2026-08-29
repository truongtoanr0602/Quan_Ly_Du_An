using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ECommerce.Api.Migrations
{
    /// <inheritdoc />
    public partial class SeedRolesAndBrands : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Brands",
                columns: new[] { "BrandID", "BrandName", "CreatedAt", "Description", "IsActive", "LogoURL", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Apple", new DateTime(2026, 8, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, true, null, null },
                    { 2, "ASUS", new DateTime(2026, 8, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, true, null, null },
                    { 3, "Lenovo", new DateTime(2026, 8, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, true, null, null },
                    { 4, "Dell", new DateTime(2026, 8, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, true, null, null },
                    { 5, "Sony", new DateTime(2026, 8, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, true, null, null }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "RoleID", "CreatedAt", "Description", "RoleName" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 8, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Customer role", "Customer" },
                    { 2, new DateTime(2026, 8, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Administrator role", "Admin" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Brands",
                keyColumn: "BrandID",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Brands",
                keyColumn: "BrandID",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Brands",
                keyColumn: "BrandID",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Brands",
                keyColumn: "BrandID",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Brands",
                keyColumn: "BrandID",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleID",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleID",
                keyValue: 2);
        }
    }
}
