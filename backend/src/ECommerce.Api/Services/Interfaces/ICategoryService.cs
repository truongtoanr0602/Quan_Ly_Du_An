using ECommerce.Api.DTOs.Categories;

namespace ECommerce.Api.Services.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken cancellationToken);

    Task<ServiceResult<CategoryResponse>> GetByIdAsync(int id, CancellationToken cancellationToken);

    Task<ServiceResult<CategoryResponse>> CreateAsync(
        CreateCategoryRequest request,
        CancellationToken cancellationToken);

    Task<ServiceResult<CategoryResponse>> UpdateAsync(
        int id,
        UpdateCategoryRequest request,
        CancellationToken cancellationToken);

    Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken);
}
