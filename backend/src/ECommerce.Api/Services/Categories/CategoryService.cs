using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Categories;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Categories;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .AsNoTracking()
            .Select(c => new CategoryDto
            {
                CategoryID = c.CategoryID,
                CategoryName = c.CategoryName,
                ParentID = c.ParentID,
                Description = c.Description,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<CategoryDto> GetCategoryByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .SingleOrDefaultAsync(c => c.CategoryID == id, cancellationToken)
            ?? throw new ResourceNotFoundException();

        return ToDto(category);
    }

    public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto, CancellationToken cancellationToken = default)
    {
        var categoryName = dto.CategoryName?.Trim();
        ValidateCategoryName(categoryName);

        var normalizedName = categoryName!.ToUpperInvariant();
        var duplicate = await _context.Categories.AnyAsync(category =>
            category.CategoryName.ToUpper() == normalizedName,
            cancellationToken);
        if (duplicate)
            throw new DomainConflictException();

        var category = new Category
        {
            CategoryName = categoryName,
            ParentID = dto.ParentID,
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await PersistenceBoundary.SaveChangesAsync(_context, cancellationToken);

        return ToDto(category);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(int id, CategoryUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories
            .SingleOrDefaultAsync(c => c.CategoryID == id, cancellationToken)
            ?? throw new ResourceNotFoundException();

        var categoryName = dto.CategoryName?.Trim();
        ValidateCategoryName(categoryName);

        var normalizedName = categoryName!.ToUpperInvariant();
        var duplicate = await _context.Categories.AnyAsync(other =>
            other.CategoryName.ToUpper() == normalizedName && other.CategoryID != id,
            cancellationToken);
        if (duplicate)
            throw new DomainConflictException();

        category.CategoryName = categoryName;
        category.ParentID = dto.ParentID;
        category.Description = dto.Description;
        category.IsActive = dto.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await PersistenceBoundary.SaveChangesAsync(_context, cancellationToken);

        return ToDto(category);
    }

    public async Task DeleteCategoryAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories
            .SingleOrDefaultAsync(c => c.CategoryID == id, cancellationToken)
            ?? throw new ResourceNotFoundException();

        var hasProducts = await _context.Products
            .AnyAsync(product => product.CategoryID == id, cancellationToken);
        var hasChildren = await _context.Categories
            .AnyAsync(child => child.ParentID == id, cancellationToken);
        if (hasProducts || hasChildren)
            throw new DomainConflictException();

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private static void ValidateCategoryName(string? categoryName)
    {
        if (string.IsNullOrWhiteSpace(categoryName) || categoryName.Length < 2)
            throw new DomainValidationException();
    }

    private static CategoryDto ToDto(Category category) => new()
    {
        CategoryID = category.CategoryID,
        CategoryName = category.CategoryName,
        ParentID = category.ParentID,
        Description = category.Description,
        IsActive = category.IsActive,
        CreatedAt = category.CreatedAt,
        UpdatedAt = category.UpdatedAt
    };
}
