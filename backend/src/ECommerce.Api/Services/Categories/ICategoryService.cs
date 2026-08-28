using ECommerce.Api.DTOs.Categories;

namespace ECommerce.Api.Services.Categories;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync(CancellationToken cancellationToken = default);
    Task<CategoryDto?> GetCategoryByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto, CancellationToken cancellationToken = default);
    Task<CategoryDto?> UpdateCategoryAsync(int id, CategoryUpdateDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteCategoryAsync(int id, CancellationToken cancellationToken = default);
}
