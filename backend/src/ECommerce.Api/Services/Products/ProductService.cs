using ECommerce.Api.Data;
using ECommerce.Api.DTOs;
using ECommerce.Api.DTOs.Products;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Products;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductDto>> SearchProductsAsync(ProductSearchRequestDto request, CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .AsQueryable();

        // Filter by Keyword (Name or Description)
        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            query = query.Where(p => p.Name.Contains(request.Keyword) || 
                                     (p.Description != null && p.Description.Contains(request.Keyword)));
        }

        // Filter by Category
        if (request.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);
        }

        // Filter by Price Range
        if (request.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= request.MinPrice.Value);
        }
        if (request.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= request.MaxPrice.Value);
        }

        // Filter by Brand
        if (!string.IsNullOrWhiteSpace(request.Brand))
        {
            query = query.Where(p => p.Brand == request.Brand);
        }

        // Calculate total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var products = await query
            .OrderByDescending(p => p.CreatedAt) // Default sorting by newest
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductDto(
                p.Id,
                p.CategoryId,
                p.Category.Name,
                p.Name,
                p.Description,
                p.Price,
                p.Brand,
                p.ImageUrl,
                p.StockQuantity,
                p.CreatedAt,
                p.UpdatedAt
            ))
            .ToListAsync(cancellationToken);

        return new PagedResult<ProductDto>
        {
            Items = products,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}
