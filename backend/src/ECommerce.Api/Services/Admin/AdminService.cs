using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Admin;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Admin;

public class AdminService : IAdminService
{
    private readonly AppDbContext _context;

    public AdminService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedUserResult> GetUsersAsync(int pageNumber, int pageSize, string? keyword, CancellationToken cancellationToken = default)
    {
        var query = _context.Users
            .Include(u => u.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(kw) ||
                u.Email.ToLower().Contains(kw));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListDto
            {
                UserId = u.UserID,
                Email = u.Email,
                FullName = u.FullName,
                Phone = u.Phone,
                Role = u.Role.RoleName,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                OrderCount = u.Orders.Count
            })
            .ToListAsync(cancellationToken);

        return new PagedUserResult
        {
            Items = users,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }
}
