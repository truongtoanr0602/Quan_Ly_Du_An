using System.ComponentModel.DataAnnotations;
using ECommerce.Api.DTOs.Orders;

namespace ECommerce.Api.Tests;

public sealed class CheckoutDtoTests
{
    [Theory]
    [InlineData("COD", true)]
    [InlineData("QR", true)]
    [InlineData("CARD", false)]
    public void PaymentMethod_AllowsOnlySupportedValues(string paymentMethod, bool expectedValid)
    {
        var dto = new CheckoutDto
        {
            AddressID = 1,
            PaymentMethod = paymentMethod
        };
        var validationResults = new List<ValidationResult>();

        var isValid = Validator.TryValidateObject(
            dto,
            new ValidationContext(dto),
            validationResults,
            validateAllProperties: true);

        Assert.Equal(expectedValid, isValid);
    }
}
