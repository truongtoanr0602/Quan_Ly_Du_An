namespace ECommerce.Api.Entities;

/// <summary>
/// Canonical role names used by JWT authorization. See AGENTS.md "Approved Architecture".
/// </summary>
public static class UserRoles
{
    public const string Admin = "Admin";

    public const string Customer = "Customer";

    public static readonly IReadOnlyList<string> All = [Admin, Customer];
}
