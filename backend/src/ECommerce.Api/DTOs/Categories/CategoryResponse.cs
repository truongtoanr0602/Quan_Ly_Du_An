namespace ECommerce.Api.DTOs.Categories;

/// <summary>
/// Public read contract for a Category. Defined in docs/architecture.md section 11.
/// </summary>
public sealed record CategoryResponse(
    int Id,
    string Name,
    string? Description,
    DateTime CreatedAt);
