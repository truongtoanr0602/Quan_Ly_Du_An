using ECommerce.Api.Data;
using ECommerce.Api.DTOs;
using ECommerce.Api.DTOs.Products;
using ECommerce.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Products;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductDto>> SearchProductsAsync(ProductSearchRequestDto request, bool includeInactive, CancellationToken cancellationToken = default)
    {
        IQueryable<ECommerce.Api.Entities.Product> query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .AsQueryable();

        if (!includeInactive)
            query = query.Where(p => p.IsActive);

        // Filter by Keyword (ProductName or Description)
        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            query = query.Where(p => p.ProductName.Contains(request.Keyword) || 
                                     (p.Description != null && p.Description.Contains(request.Keyword)));
        }

        // Filter by Category
        if (request.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryID == request.CategoryId.Value);
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
            query = query.Where(p => p.Brand.BrandName == request.Brand);
        }

        // Calculate total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var products = await query
            .OrderByDescending(p => p.CreatedAt) // Default sorting by newest
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductDto(
                p.ProductID,
                p.CategoryID,
                p.Category.CategoryName,
                p.ProductName,
                p.SKU,
                p.Description,
                p.Price,
                p.BrandID,
                p.Brand.BrandName,
                p.Images.Where(i => i.IsPrimary).Select(i => i.ImageURL).FirstOrDefault(),
                p.StockQuantity,
                p.IsActive,
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

    public async Task<ProductDto> GetProductByIdAsync(int id, bool includeInactive, CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .AsNoTracking()
            .AsQueryable();

        if (!includeInactive)
            query = query.Where(p => p.IsActive);

        var product = await query.FirstOrDefaultAsync(p => p.ProductID == id, cancellationToken);

        if (product == null)
            throw new ResourceNotFoundException();

        return new ProductDto(
            product.ProductID,
            product.CategoryID,
            product.Category?.CategoryName ?? "",
            product.ProductName,
            product.SKU,
            product.Description,
            product.Price,
            product.BrandID,
            product.Brand?.BrandName,
            product.Images?.Where(i => i.IsPrimary).Select(i => i.ImageURL).FirstOrDefault(),
            product.StockQuantity,
            product.IsActive,
            product.CreatedAt,
            product.UpdatedAt
        );
    }

    public async Task<ProductDto> CreateProductAsync(ProductCreateDto dto, CancellationToken cancellationToken = default)
    {
        await ValidateReferencesAsync(dto.CategoryID, dto.BrandID, cancellationToken);
        await EnsureSkuIsAvailableAsync(dto.SKU, productId: null, cancellationToken);

        var product = new ECommerce.Api.Entities.Product
        {
            CategoryID = dto.CategoryID,
            ProductName = dto.ProductName,
            SKU = dto.SKU,
            Description = dto.Description,
            Price = dto.Price,
            BrandID = dto.BrandID,
            StockQuantity = dto.StockQuantity,
            IsActive = true
        };

        if (!string.IsNullOrEmpty(dto.ImageUrl))
        {
            product.Images.Add(new ECommerce.Api.Entities.ProductImage
            {
                ImageURL = dto.ImageUrl,
                IsPrimary = true
            });
        }

        _context.Products.Add(product);
        await PersistenceBoundary.SaveChangesAsync(_context, cancellationToken);

        return await GetProductByIdAsync(product.ProductID, includeInactive: true, cancellationToken: cancellationToken);
    }

    public async Task<ProductDto> UpdateProductAsync(int id, ProductUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.ProductID == id, cancellationToken);

        if (product == null)
            throw new ResourceNotFoundException();

        await ValidateReferencesAsync(dto.CategoryID, dto.BrandID, cancellationToken);
        await EnsureSkuIsAvailableAsync(dto.SKU, id, cancellationToken);

        product.CategoryID = dto.CategoryID;
        product.ProductName = dto.ProductName;
        product.SKU = dto.SKU;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.BrandID = dto.BrandID;
        product.StockQuantity = dto.StockQuantity;
        product.IsActive = dto.IsActive;

        // Xử lý ảnh cơ bản (ghi đè ảnh primary nếu có truyền lên ImageUrl mới)
        if (!string.IsNullOrEmpty(dto.ImageUrl))
        {
            var primaryImage = product.Images.FirstOrDefault(i => i.IsPrimary);
            if (primaryImage != null)
            {
                primaryImage.ImageURL = dto.ImageUrl;
            }
            else
            {
                product.Images.Add(new ECommerce.Api.Entities.ProductImage
                {
                    ImageURL = dto.ImageUrl,
                    IsPrimary = true
                });
            }
        }

        await PersistenceBoundary.SaveChangesAsync(_context, cancellationToken);

        return await GetProductByIdAsync(product.ProductID, includeInactive: true, cancellationToken: cancellationToken);
    }

    public async Task DeleteProductAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync(new object[] { id }, cancellationToken);
        if (product == null)
            throw new ResourceNotFoundException();

        // Soft delete bằng cách set IsActive = false (tùy nghiệp vụ)
        product.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidateReferencesAsync(int categoryId, int brandId, CancellationToken cancellationToken)
    {
        if (!await _context.Categories.AnyAsync(category => category.CategoryID == categoryId, cancellationToken))
            throw new ResourceNotFoundException();

        if (!await _context.Brands.AnyAsync(brand => brand.BrandID == brandId, cancellationToken))
            throw new ResourceNotFoundException();
    }

    private async Task EnsureSkuIsAvailableAsync(string sku, int? productId, CancellationToken cancellationToken)
    {
        var exists = await _context.Products.AnyAsync(
            product => product.SKU == sku && (!productId.HasValue || product.ProductID != productId.Value),
            cancellationToken);

        if (exists)
            throw new DomainConflictException();
    }
}
