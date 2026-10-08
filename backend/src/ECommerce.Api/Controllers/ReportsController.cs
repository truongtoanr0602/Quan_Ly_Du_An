using ECommerce.Api.Services.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    // US-6: Dashboard summary
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var result = await _reportService.GetDashboardSummaryAsync(cancellationToken);
        return Ok(result);
    }

    // US-6: Revenue report
    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetRevenueAsync(from, to, cancellationToken);
        return Ok(result);
    }

    // US-6: Top selling products
    [HttpGet("top-products")]
    public async Task<IActionResult> GetTopProducts(
        [FromQuery] int count = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _reportService.GetTopProductsAsync(count, cancellationToken);
        return Ok(result);
    }
}
