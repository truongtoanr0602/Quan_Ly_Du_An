using ECommerce.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Data;

internal static class PersistenceBoundary
{
    private static readonly string[] RecognizedUniqueConstraints =
    [
        "UQ_Users_Email",
        "UQ_Categories_Name",
        "UQ_Products_SKU"
    ];

    public static async Task<int> SaveChangesAsync(
        AppDbContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (IsRecognizedUniqueConstraintViolation(exception))
        {
            throw new DomainConflictException();
        }
    }

    private static bool IsRecognizedUniqueConstraintViolation(DbUpdateException exception)
    {
        for (Exception? current = exception; current is not null; current = current.InnerException)
        {
            var message = current.Message;
            var isDuplicateKeyFailure =
                message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                message.Contains("unique key constraint", StringComparison.OrdinalIgnoreCase);

            if (isDuplicateKeyFailure && RecognizedUniqueConstraints.Any(constraintName =>
                    message.Contains(constraintName, StringComparison.OrdinalIgnoreCase)))
            {
                return true;
            }
        }

        return false;
    }
}
