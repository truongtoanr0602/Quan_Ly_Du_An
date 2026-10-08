using ECommerce.Api.Data;
using ECommerce.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Tests;

public sealed class PersistenceBoundaryTests
{
    [Theory]
    [InlineData("UQ_Users_Email")]
    [InlineData("UQ_Categories_Name")]
    [InlineData("UQ_Products_SKU")]
    public async Task SaveChangesAsyncTranslatesRecognizedUniqueConstraint(string constraintName)
    {
        var databaseException = new DbUpdateException(
            "An error occurred while saving the entity changes.",
            new Exception($"Violation of UNIQUE KEY constraint '{constraintName}'. Cannot insert duplicate key."));
        await using var context = new ThrowingAppDbContext(databaseException);

        await Assert.ThrowsAsync<DomainConflictException>(() =>
            PersistenceBoundary.SaveChangesAsync(context));
    }

    [Fact]
    public async Task SaveChangesAsyncPreservesUnrecognizedPersistenceFailures()
    {
        var databaseException = new DbUpdateException(
            "An error occurred while saving the entity changes.",
            new Exception("The database rejected the write due to a foreign key constraint."));
        await using var context = new ThrowingAppDbContext(databaseException);

        var actual = await Assert.ThrowsAsync<DbUpdateException>(() =>
            PersistenceBoundary.SaveChangesAsync(context));

        Assert.Same(databaseException, actual);
    }

    private sealed class ThrowingAppDbContext(Exception exception)
        : AppDbContext(new DbContextOptionsBuilder<AppDbContext>().Options)
    {
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            Task.FromException<int>(exception);
    }
}
