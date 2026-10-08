namespace ECommerce.Api.DTOs.Reports;

public class DashboardSummaryDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalProducts { get; set; }
    public int PendingOrders { get; set; }
    public int LowStockProducts { get; set; }
}

public class RevenueSummaryDto
{
    public List<RevenueByDateDto> DailyRevenue { get; set; } = [];
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
}

public class RevenueByDateDto
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public int TotalQuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
}
