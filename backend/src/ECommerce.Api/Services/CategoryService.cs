using ECommerce.Api.Data;
using ECommerce.Api.Data.Configurations;
using ECommerce.Api.DTOs.Categories;
using ECommerce.Api.Entities;
using ECommerce.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

/// <summary>
/// Business rules for US-2 - Category management.
/// </summary>
public sealed class CategoryService(AppDbContext dbContext) : ICategoryService
{
    private const string DuplicateNameDetail = "A category with the same name already exists.";

    private const string CategoryInUseDetail =
        "The category cannot be deleted because products are still assigned to it.";

    public async Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .Select(category => new CategoryResponse(
                category.Id,
                category.Name,
                category.Description,
                category.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<ServiceResult<CategoryResponse>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories
            .AsNoTracking()
            .Where(candidate => candidate.Id == id)
            .Select(candidate => new CategoryResponse(
                candidate.Id,
                candidate.Name,
                candidate.Description,
                candidate.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);

        return category is null
            ? ServiceResult<CategoryResponse>.NotFound(NotFoundDetail(id))
            : ServiceResult<CategoryResponse>.Success(category);
    }

    public async Task<ServiceResult<CategoryResponse>> CreateAsync(
        CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var (name, description, errors) = Normalize(request.Name, request.Description);

        if (errors.Count > 0)
        {
            return ServiceResult<CategoryResponse>.Invalid(errors);
        }

        if (await NameIsTakenAsync(name, excludedId: null, cancellationToken))
        {
            return ServiceResult<CategoryResponse>.Conflict(DuplicateNameDetail);
        }

        var category = new Category
        {
            Name = name,
            Description = description,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ServiceResult<CategoryResponse>.Success(Map(category));
    }

    public async Task<ServiceResult<CategoryResponse>> UpdateAsync(
        int id,
        UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories
            .FirstOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);

        if (category is null)
        {
            return ServiceResult<CategoryResponse>.NotFound(NotFoundDetail(id));
        }

        var (name, description, errors) = Normalize(request.Name, request.Description);

        if (errors.Count > 0)
        {
            return ServiceResult<CategoryResponse>.Invalid(errors);
        }

        if (await NameIsTakenAsync(name, excludedId: id, cancellationToken))
        {
            return ServiceResult<CategoryResponse>.Conflict(DuplicateNameDetail);
        }

        category.Name = name;
        category.Description = description;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ServiceResult<CategoryResponse>.Success(Map(category));
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories
            .FirstOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);

        if (category is null)
        {
            return ServiceResult.NotFound(NotFoundDetail(id));
        }

        var hasProducts = await dbContext.Products
            .AnyAsync(product => product.CategoryId == id, cancellationToken);

        if (hasProducts)
        {
            return ServiceResult.Conflict(CategoryInUseDetail);
        }

        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ServiceResult.Success();
    }

    private Task<bool> NameIsTakenAsync(string name, int? excludedId, CancellationToken cancellationToken)
    {
        // Compared on the lowered value so the rule holds on any provider, not only on a
        // case-insensitive SQL Server collation. IX_Categories_Name is the database-level guard.
        var normalizedName = name.ToLower();

        var query = dbContext.Categories
            .Where(category => category.Name.ToLower() == normalizedName);

        if (excludedId is int currentId)
        {
            query = query.Where(category => category.Id != currentId);
        }

        return query.AnyAsync(cancellationToken);
    }

    private static (string Name, string? Description, Dictionary<string, string[]> Errors) Normalize(
        string? rawName,
        string? rawDescription)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);

        var name = (rawName ?? string.Empty).Trim();

        if (name.Length is < CategoryConfiguration.NameMinLength or > CategoryConfiguration.NameMaxLength)
        {
            errors[nameof(CreateCategoryRequest.Name)] =
            [
                $"Name must contain between {CategoryConfiguration.NameMinLength} and " +
                $"{CategoryConfiguration.NameMaxLength} characters after trimming."
            ];
        }

        var description = string.IsNullOrWhiteSpace(rawDescription) ? null : rawDescription.Trim();

        if (description is not null && description.Length > CategoryConfiguration.DescriptionMaxLength)
        {
            errors[nameof(CreateCategoryRequest.Description)] =
            [
                $"Description must contain at most {CategoryConfiguration.DescriptionMaxLength} characters."
            ];
        }

        return (name, description, errors);
    }

    private static CategoryResponse Map(Category category) =>
        new(category.Id, category.Name, category.Description, category.CreatedAt);

    private static string NotFoundDetail(int id) => $"Category {id} was not found.";
}
