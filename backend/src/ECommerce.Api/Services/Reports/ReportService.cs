using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Reports;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Reports;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default)
    {
        var completedStatuses = new[] { "Delivered" };

        var totalRevenue = await _context.Orders
            .Where(o => completedStatuses.Contains(o.OrderStatus))
            .SumAsync(o => o.TotalAmount, cancellationToken);

        var totalOrders = await _context.Orders.CountAsync(cancellationToken);

        var totalCustomers = await _context.Users
            .Include(u => u.Role)
            .CountAsync(u => u.Role.RoleName == "Customer", cancellationToken);

        var totalProducts = await _context.Products.CountAsync(cancellationToken);

        var pendingOrders = await _context.Orders
            .CountAsync(o => o.OrderStatus == "Pending", cancellationToken);

        var lowStockProducts = await _context.Products
            .CountAsync(p => p.StockQuantity <= 10 && p.IsActive, cancellationToken);

        return new DashboardSummaryDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            TotalCustomers = totalCustomers,
            TotalProducts = totalProducts,
            PendingOrders = pendingOrders,
            LowStockProducts = lowStockProducts
        };
    }

    public async Task<RevenueSummaryDto> GetRevenueAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken = default)
    {
        var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
        var toDate = to ?? DateTime.UtcNow;

        var orders = await _context.Orders
            .Where(o => o.OrderStatus == "Delivered" &&
                        o.CreatedAt >= fromDate &&
                        o.CreatedAt <= toDate)
            .ToListAsync(cancellationToken);

        var dailyRevenue = orders
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new RevenueByDateDto
            {
                Date = g.Key,
                Revenue = g.Sum(o => o.TotalAmount),
                OrderCount = g.Count()
            })
            .OrderBy(r => r.Date)
            .ToList();

        return new RevenueSummaryDto
        {
            DailyRevenue = dailyRevenue,
            TotalRevenue = orders.Sum(o => o.TotalAmount),
            TotalOrders = orders.Count
        };
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(int count, CancellationToken cancellationToken = default)
    {
        return await _context.OrderDetails
            .Include(od => od.Product)
                .ThenInclude(p => p.Images)
            .Include(od => od.Order)
            .Where(od => od.Order.OrderStatus == "Delivered")
            .GroupBy(od => new { od.ProductID, od.Product.ProductName })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductID,
                ProductName = g.Key.ProductName,
                ImageUrl = g.First().Product.Images.OrderBy(i => i.ImageID).Select(i => i.ImageURL).FirstOrDefault(),
                TotalQuantitySold = g.Sum(od => od.Quantity),
                TotalRevenue = g.Sum(od => od.TotalPrice)
            })
            .OrderByDescending(t => t.TotalQuantitySold)
            .Take(count)
            .ToListAsync(cancellationToken);
    }
}
