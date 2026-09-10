using ECommerce.Api.DTOs.Admin;

namespace ECommerce.Api.Services.Admin;

public interface IAdminService
{
    Task<PagedUserResult> GetUsersAsync(int pageNumber, int pageSize, string? keyword, CancellationToken cancellationToken = default);
}

public class PagedUserResult
{
    public List<UserListDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}
