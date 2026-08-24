namespace ECommerce.Api.Data;

/// <summary>
/// Explicit SQL Server collations so uniqueness rules do not depend on the server default collation.
/// </summary>
public static class DatabaseCollations
{
    /// <summary>Case-insensitive, accent-sensitive. Required by US-2 for Category.Name uniqueness.</summary>
    public const string CaseInsensitive = "SQL_Latin1_General_CP1_CI_AS";
}
