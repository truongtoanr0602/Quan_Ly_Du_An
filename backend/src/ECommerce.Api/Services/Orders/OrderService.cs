using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Orders;
using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Orders;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;

    private static readonly string[] CancellableStatuses = ["Pending", "Confirmed"];
    private static readonly string[] ValidStatuses = ["Pending", "Confirmed", "Shipping", "Delivered", "Cancelled"];

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> CreateOrderAsync(int userId, CreateOrderDto dto, CancellationToken cancellationToken = default)
    {
        // Lấy giỏ hàng
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserID == userId, cancellationToken)
            ?? throw new InvalidOperationException("Cart is empty.");

        if (cart.Items.Count == 0)
            throw new InvalidOperationException("Cart is empty.");

        // Validate stock
        foreach (var item in cart.Items)
        {
            if (!item.Product.IsActive)
                throw new InvalidOperationException($"Product '{item.Product.ProductName}' is no longer available.");
            if (item.Quantity > item.Product.StockQuantity)
                throw new InvalidOperationException($"Not enough stock for '{item.Product.ProductName}'. Available: {item.Product.StockQuantity}.");
        }

        // Tính tổng
        var subTotal = cart.Items.Sum(ci => ci.Product.Price * ci.Quantity);
        var shippingFee = 0m; // MVP: miễn phí ship

        var order = new Order
        {
            UserID = userId,
            ReceiverName = dto.ReceiverName,
            ReceiverPhone = dto.ReceiverPhone,
            Province = dto.Province,
            District = dto.District,
            Ward = dto.Ward,
            ShippingAddress = dto.ShippingAddress,
            SubTotal = subTotal,
            ShippingFee = shippingFee,
            TotalAmount = subTotal + shippingFee,
            PaymentMethod = dto.PaymentMethod,
            PaymentStatus = "Unpaid",
            OrderStatus = "Pending",
            Note = dto.Note,
            CreatedAt = DateTime.UtcNow
        };

        // Tạo OrderDetails (snapshot sản phẩm)
        foreach (var item in cart.Items)
        {
            order.OrderDetails.Add(new OrderDetail
            {
                ProductID = item.ProductID,
                ProductName = item.Product.ProductName,
                SKU = item.Product.SKU,
                Quantity = item.Quantity,
                UnitPrice = item.Product.Price,
                TotalPrice = item.Product.Price * item.Quantity
            });

            // Trừ stock
            item.Product.StockQuantity -= item.Quantity;
        }

        // Ghi lịch sử trạng thái
        order.StatusHistories.Add(new OrderStatusHistory
        {
            NewStatus = "Pending",
            Note = "Order created",
            ChangedBy = userId,
            ChangedAt = DateTime.UtcNow
        });

        _context.Orders.Add(order);

        // Xóa giỏ hàng
        _context.CartItems.RemoveRange(cart.Items);

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(order);
    }

    public async Task<List<OrderDto>> GetUserOrdersAsync(int userId, CancellationToken cancellationToken = default)
    {
        var orders = await _context.Orders
            .Where(o => o.UserID == userId)
            .Include(o => o.OrderDetails)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        return orders.Select(MapToDto).ToList();
    }

    public async Task<OrderDto> GetOrderByIdAsync(int userId, long orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.OrderDetails)
            .FirstOrDefaultAsync(o => o.OrderID == orderId && o.UserID == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Order not found.");

        return MapToDto(order);
    }

    public async Task<OrderDto> CancelOrderAsync(int userId, long orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.OrderDetails)
            .FirstOrDefaultAsync(o => o.OrderID == orderId && o.UserID == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Order not found.");

        if (!CancellableStatuses.Contains(order.OrderStatus))
            throw new InvalidOperationException($"Cannot cancel order with status '{order.OrderStatus}'. Only orders with status 'Pending' or 'Confirmed' can be cancelled.");

        // Hoàn lại stock
        foreach (var detail in order.OrderDetails)
        {
            var product = await _context.Products.FindAsync([detail.ProductID], cancellationToken);
            if (product != null)
            {
                product.StockQuantity += detail.Quantity;
            }
        }

        var oldStatus = order.OrderStatus;
        order.OrderStatus = "Cancelled";
        order.CancelledAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        order.StatusHistories.Add(new OrderStatusHistory
        {
            OldStatus = oldStatus,
            NewStatus = "Cancelled",
            Note = "Cancelled by customer",
            ChangedBy = userId,
            ChangedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(order);
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(long orderId, int adminUserId, UpdateOrderStatusDto dto, CancellationToken cancellationToken = default)
    {
        if (!ValidStatuses.Contains(dto.NewStatus))
            throw new InvalidOperationException($"Invalid status '{dto.NewStatus}'. Valid statuses: {string.Join(", ", ValidStatuses)}.");

        var order = await _context.Orders
            .Include(o => o.OrderDetails)
            .FirstOrDefaultAsync(o => o.OrderID == orderId, cancellationToken)
            ?? throw new KeyNotFoundException("Order not found.");

        if (order.OrderStatus == dto.NewStatus)
            throw new InvalidOperationException("Order is already in this status.");

        var oldStatus = order.OrderStatus;
        order.OrderStatus = dto.NewStatus;
        order.UpdatedAt = DateTime.UtcNow;

        if (dto.NewStatus == "Confirmed")
            order.ConfirmedAt = DateTime.UtcNow;
        else if (dto.NewStatus == "Delivered")
        {
            order.CompletedAt = DateTime.UtcNow;
            order.PaymentStatus = "Paid";
        }
        else if (dto.NewStatus == "Cancelled")
        {
            order.CancelledAt = DateTime.UtcNow;
            // Hoàn lại stock
            foreach (var detail in order.OrderDetails)
            {
                var product = await _context.Products.FindAsync([detail.ProductID], cancellationToken);
                if (product != null)
                    product.StockQuantity += detail.Quantity;
            }
        }

        order.StatusHistories.Add(new OrderStatusHistory
        {
            OldStatus = oldStatus,
            NewStatus = dto.NewStatus,
            Note = dto.Note,
            ChangedBy = adminUserId,
            ChangedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(order);
    }

    public async Task<PagedOrderResult> GetAllOrdersAsync(int pageNumber, int pageSize, string? status, CancellationToken cancellationToken = default)
    {
        var query = _context.Orders
            .Include(o => o.OrderDetails)
            .Include(o => o.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(o => o.OrderStatus == status);

        var totalCount = await query.CountAsync(cancellationToken);

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedOrderResult
        {
            Items = orders.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<OrderDto> GetOrderByIdAdminAsync(long orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.OrderDetails)
            .FirstOrDefaultAsync(o => o.OrderID == orderId, cancellationToken)
            ?? throw new KeyNotFoundException("Order not found.");

        return MapToDto(order);
    }

    private static OrderDto MapToDto(Order order) => new()
    {
        OrderId = order.OrderID,
        ReceiverName = order.ReceiverName,
        ReceiverPhone = order.ReceiverPhone,
        ShippingAddress = order.ShippingAddress,
        SubTotal = order.SubTotal,
        ShippingFee = order.ShippingFee,
        TotalAmount = order.TotalAmount,
        PaymentMethod = order.PaymentMethod,
        PaymentStatus = order.PaymentStatus,
        OrderStatus = order.OrderStatus,
        Note = order.Note,
        CreatedAt = order.CreatedAt,
        UpdatedAt = order.UpdatedAt,
        Items = order.OrderDetails.Select(d => new OrderDetailDto
        {
            OrderDetailId = d.OrderDetailID,
            ProductId = d.ProductID,
            ProductName = d.ProductName,
            Sku = d.SKU,
            Quantity = d.Quantity,
            UnitPrice = d.UnitPrice,
            TotalPrice = d.TotalPrice
        }).ToList()
    };
}
