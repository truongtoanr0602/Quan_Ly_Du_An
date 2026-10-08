using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Inventory;
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
            throw new InvalidOperationException($"Invalid transaction type. Valid types: {string.Join(", ", ValidTransactionTypes)}.");

        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .FirstOrDefaultAsync(p => p.ProductID == productId, cancellationToken)
            ?? throw new KeyNotFoundException("Product not found.");

        var previousStock = product.StockQuantity;
        int newStock;

        switch (dto.TransactionType)
        {
            case "Import":
                if (dto.Quantity <= 0)
                    throw new InvalidOperationException("Import quantity must be positive.");
                newStock = previousStock + dto.Quantity;
                break;
            case "Export":
                if (dto.Quantity <= 0)
                    throw new InvalidOperationException("Export quantity must be positive.");
                if (dto.Quantity > previousStock)
                    throw new InvalidOperationException("Not enough stock to export.");
                newStock = previousStock - dto.Quantity;
                break;
            case "Adjustment":
                newStock = dto.Quantity; // Set absolute value
                if (newStock < 0)
                    throw new InvalidOperationException("Stock cannot be negative.");
                break;
            default:
                throw new InvalidOperationException("Invalid transaction type.");
        }

        product.StockQuantity = newStock;
        product.UpdatedAt = DateTime.UtcNow;

        _context.InventoryTransactions.Add(new InventoryTransaction
        {
            ProductID = productId,
            TransactionType = dto.TransactionType,
            Quantity = dto.Quantity,
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
