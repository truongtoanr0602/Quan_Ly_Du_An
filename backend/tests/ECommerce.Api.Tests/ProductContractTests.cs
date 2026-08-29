using System.Text.Json;
using ECommerce.Api.DTOs.Products;

namespace ECommerce.Api.Tests;

public sealed class ProductContractTests
{
    [Fact]
    public void ProductDtoIncludesIsActiveAsAnAdditiveResponseField()
    {
        var property = typeof(ProductDto).GetProperty(nameof(ProductDto.IsActive));

        Assert.NotNull(property);
        Assert.Equal(typeof(bool), property.PropertyType);
    }

    [Fact]
    public void ProductDtoSerializesIsActiveWithoutDroppingExistingFields()
    {
        var product = new ProductDto(
            42, 1, "Category", "Product", "SKU-42", "Description", 10, 1, "Brand", null, 1, true,
            DateTime.UtcNow, null);

        using var document = JsonDocument.Parse(JsonSerializer.Serialize(product));
        var root = document.RootElement;

        Assert.True(root.GetProperty("IsActive").GetBoolean());
        Assert.Equal("Product", root.GetProperty("ProductName").GetString());
        Assert.Equal("SKU-42", root.GetProperty("SKU").GetString());
    }
}
