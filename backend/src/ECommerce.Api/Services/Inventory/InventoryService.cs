using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Inventory;
using ECommerce.Api.Exceptions;
using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Inventory;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    private static readonly string[] ValidTransactionTypes = ["Import", "Export", "Adjustment"];

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<InventoryDto>> GetInventoryListAsync(string? keyword, CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.ToLower();
            query = query.Where(p =>
                p.ProductName.ToLower().Contains(kw) ||
                p.SKU.ToLower().Contains(kw));
        }

        return await query
            .OrderBy(p => p.ProductName)
            .Select(p => new InventoryDto
            {
                ProductId = p.ProductID,
                ProductName = p.ProductName,
                Sku = p.SKU,
                StockQuantity = p.StockQuantity,
                CategoryName = p.Category.CategoryName,
                BrandName = p.Brand.BrandName,
                IsActive = p.IsActive
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<InventoryDto> UpdateStockAsync(int productId, int adminUserId, UpdateStockDto dto, CancellationToken cancellationToken = default)
    {
        if (!ValidTransactionTypes.Contains(dto.TransactionType))
            throw new DomainValidationException();

        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .FirstOrDefaultAsync(p => p.ProductID == productId, cancellationToken)
            ?? throw new ResourceNotFoundException();

        var previousStock = product.StockQuantity;
        int newStock;

        switch (dto.TransactionType)
        {
            case "Import":
                if (dto.Quantity <= 0)
                    throw new DomainValidationException();
                try { newStock = checked(previousStock + dto.Quantity); }
                catch (OverflowException) { throw new DomainValidationException(); }
                break;
            case "Export":
                if (dto.Quantity <= 0)
                    throw new DomainValidationException();
                if (dto.Quantity > previousStock)
                    throw new DomainConflictException();
                newStock = previousStock - dto.Quantity;
                break;
            case "Adjustment":
                newStock = dto.Quantity; // Set absolute value
                if (newStock < 0)
                    throw new DomainValidationException();
                break;
            default:
                throw new DomainValidationException();
        }

        product.StockQuantity = newStock;
        product.UpdatedAt = DateTime.UtcNow;

        var storedType = dto.TransactionType switch
        {
            "Import" => "IMPORT",
            "Export" => "SALE",
            _ => "ADJUSTMENT"
        };

        _context.InventoryTransactions.Add(new InventoryTransaction
        {
            ProductID = productId,
            TransactionType = storedType,
            Quantity = newStock - previousStock,
            PreviousStock = previousStock,
            NewStock = newStock,
            Note = dto.Note,
            CreatedBy = adminUserId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        return new InventoryDto
        {
            ProductId = product.ProductID,
            ProductName = product.ProductName,
            Sku = product.SKU,
            StockQuantity = product.StockQuantity,
            CategoryName = product.Category.CategoryName,
            BrandName = product.Brand.BrandName,
            IsActive = product.IsActive
        };
    }

    public async Task<List<InventoryTransactionDto>> GetTransactionsAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await _context.InventoryTransactions
            .Where(t => t.ProductID == productId)
            .Include(t => t.CreatedByUser)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new InventoryTransactionDto
            {
                TransactionId = t.InventoryTransactionID,
                ProductId = t.ProductID,
                ProductName = t.Product.ProductName,
                TransactionType = t.TransactionType,
                Quantity = t.Quantity,
                PreviousStock = t.PreviousStock,
                NewStock = t.NewStock,
                Note = t.Note,
                CreatedByName = t.CreatedByUser != null ? t.CreatedByUser.FullName : null,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
