namespace ECommerce.Api.DTOs.Products;

public record ProductSearchRequestDto(
    string? Keyword,
    int? CategoryId,
    decimal? MinPrice,
    decimal? MaxPrice,
    string? Brand,
    int PageNumber = 1,
    int PageSize = 10
);
