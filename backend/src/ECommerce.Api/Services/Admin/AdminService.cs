using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Admin;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Admin;

public class AdminService : IAdminService
{
    private static readonly string[] ValidOrderStatuses = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];
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

    public async Task<PagedAdminOrderResult> GetOrdersAsync(
        int pageNumber, int pageSize, string? status, CancellationToken cancellationToken = default)
    {
        var query = _context.Orders.Include(o => o.User).Include(o => o.OrderDetails).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(o => o.OrderStatus == status);

        var totalCount = await query.CountAsync(cancellationToken);
        var orders = await query.OrderByDescending(o => o.CreatedAt)
            .Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedAdminOrderResult
        {
            Items = orders.Select(MapOrder).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<AdminOrderDto> GetOrderAsync(long orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders.Include(o => o.User).Include(o => o.OrderDetails)
            .SingleOrDefaultAsync(o => o.OrderID == orderId, cancellationToken)
            ?? throw new ResourceNotFoundException();
        return MapOrder(order);
    }

    public async Task<AdminOrderDto> UpdateOrderStatusAsync(
        long orderId, int adminUserId, string newStatus, string? note, CancellationToken cancellationToken = default)
    {
        if (!ValidOrderStatuses.Contains(newStatus)) throw new DomainValidationException();

        var order = await _context.Orders.Include(o => o.User).Include(o => o.OrderDetails)
            .SingleOrDefaultAsync(o => o.OrderID == orderId, cancellationToken)
            ?? throw new ResourceNotFoundException();
        if (order.OrderStatus == newStatus) throw new DomainConflictException();

        var oldStatus = order.OrderStatus;
        order.OrderStatus = newStatus;
        order.UpdatedAt = DateTime.UtcNow;
        if (newStatus == "CONFIRMED") order.ConfirmedAt = DateTime.UtcNow;
        if (newStatus == "COMPLETED")
        {
            order.CompletedAt = DateTime.UtcNow;
            order.PaymentStatus = "PAID";
        }
        if (newStatus == "CANCELLED") order.CancelledAt = DateTime.UtcNow;

        order.StatusHistories.Add(new OrderStatusHistory
        {
            OldStatus = oldStatus,
            NewStatus = newStatus,
            Note = note,
            ChangedBy = adminUserId,
            ChangedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync(cancellationToken);
        return MapOrder(order);
    }

    private static AdminOrderDto MapOrder(Order order) => new()
    {
        OrderId = order.OrderID,
        UserId = order.UserID,
        CustomerName = order.User?.FullName ?? string.Empty,
        CustomerEmail = order.User?.Email ?? string.Empty,
        ReceiverName = order.ReceiverName,
        ReceiverPhone = order.ReceiverPhone,
        ShippingAddress = order.ShippingAddress,
        TotalAmount = order.TotalAmount,
        PaymentMethod = order.PaymentMethod,
        PaymentStatus = order.PaymentStatus,
        OrderStatus = order.OrderStatus,
        CreatedAt = order.CreatedAt,
        UpdatedAt = order.UpdatedAt,
        Items = order.OrderDetails.Select(item => new AdminOrderDetailDto
        {
            OrderDetailId = item.OrderDetailID,
            ProductId = item.ProductID,
            ProductName = item.ProductName,
            Sku = item.SKU,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            TotalPrice = item.TotalPrice
        }).ToList()
    };
}
