using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Api.Migrations;

public partial class RemoveModelManagedSeedData : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Stop tracking seed rows by fixed IDs. Existing roles, brands, and references are retained.
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Database-specific IDs cannot safely be recreated or overwritten on rollback.
    }
}
