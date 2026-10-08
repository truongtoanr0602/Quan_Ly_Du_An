using ECommerce.Api.DTOs.Reports;

namespace ECommerce.Api.Services.Reports;

public interface IReportService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default);
    Task<RevenueSummaryDto> GetRevenueAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken = default);
    Task<List<TopProductDto>> GetTopProductsAsync(int count, CancellationToken cancellationToken = default);
}
