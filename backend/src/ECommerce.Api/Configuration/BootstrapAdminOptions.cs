namespace ECommerce.Api.Configuration;

public sealed record BootstrapAdminOptions(string? Email, string? Password, string? FullName)
{
    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Email) &&
        !string.IsNullOrWhiteSpace(Password) &&
        !string.IsNullOrWhiteSpace(FullName);

    public bool IsPartiallyConfigured =>
        !IsConfigured && new[] { Email, Password, FullName }.Any(value => !string.IsNullOrWhiteSpace(value));
}
