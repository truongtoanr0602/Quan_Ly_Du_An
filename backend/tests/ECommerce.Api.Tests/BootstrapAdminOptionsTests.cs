using ECommerce.Api.Configuration;

namespace ECommerce.Api.Tests;

public sealed class BootstrapAdminOptionsTests
{
    [Theory]
    [InlineData(null, null, null, false)]
    [InlineData("admin@example.test", "password", null, true)]
    [InlineData("admin@example.test", "password", "Development Admin", false)]
    public void BootstrapOptionsReportsOnlyPartialConfigurationAsInvalid(
        string? email,
        string? password,
        string? fullName,
        bool expectedInvalid)
    {
        var options = new BootstrapAdminOptions(email, password, fullName);

        Assert.Equal(expectedInvalid, options.IsPartiallyConfigured);
    }
}
