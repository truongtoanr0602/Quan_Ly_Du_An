using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Carts;
using ECommerce.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Carts;

public class CartService : ICartService
{
    private readonly AppDbContext _context;

    public CartService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> GetCartAsync(int userId, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);

        var items = await _context.CartItems
            .Where(ci => ci.CartID == cart.CartID)
            .Include(ci => ci.Product)
                .ThenInclude(p => p.Images)
            .Select(ci => new CartItemDto
            {
                CartItemId = ci.CartItemID,
                ProductId = ci.ProductID,
                ProductName = ci.Product.ProductName,
                ImageUrl = ci.Product.Images.OrderBy(i => i.ImageID).Select(i => i.ImageURL).FirstOrDefault(),
                Price = ci.Product.Price,
                Quantity = ci.Quantity,
                StockQuantity = ci.Product.StockQuantity,
                SubTotal = ci.Product.Price * ci.Quantity
            })
            .ToListAsync(cancellationToken);

        return new CartDto
        {
            CartId = cart.CartID,
            Items = items,
            TotalPrice = items.Sum(i => i.SubTotal),
            TotalItems = items.Sum(i => i.Quantity)
        };
    }

    public async Task<CartDto> AddItemAsync(int userId, AddCartItemDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync([dto.ProductId], cancellationToken)
            ?? throw new KeyNotFoundException("Product not found.");

        if (!product.IsActive)
            throw new InvalidOperationException("Product is not available.");

        if (product.StockQuantity < dto.Quantity)
            throw new InvalidOperationException("Not enough stock available.");

        var cart = await GetOrCreateCartAsync(userId, cancellationToken);

        var existingItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.CartID == cart.CartID && ci.ProductID == dto.ProductId, cancellationToken);

        if (existingItem != null)
        {
            var newQuantity = existingItem.Quantity + dto.Quantity;
            if (newQuantity > product.StockQuantity)
                throw new InvalidOperationException("Not enough stock available.");

            existingItem.Quantity = newQuantity;
            existingItem.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _context.CartItems.Add(new CartItem
            {
                CartID = cart.CartID,
                ProductID = dto.ProductId,
                Quantity = dto.Quantity,
                AddedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return await GetCartAsync(userId, cancellationToken);
    }

    public async Task<CartDto> UpdateItemQuantityAsync(int userId, long cartItemId, UpdateCartItemDto dto, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);

        var cartItem = await _context.CartItems
            .Include(ci => ci.Product)
            .FirstOrDefaultAsync(ci => ci.CartItemID == cartItemId && ci.CartID == cart.CartID, cancellationToken)
            ?? throw new KeyNotFoundException("Cart item not found.");

        if (dto.Quantity > cartItem.Product.StockQuantity)
            throw new InvalidOperationException("Not enough stock available.");

        cartItem.Quantity = dto.Quantity;
        cartItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return await GetCartAsync(userId, cancellationToken);
    }

    public async Task RemoveItemAsync(int userId, long cartItemId, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);

        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.CartItemID == cartItemId && ci.CartID == cart.CartID, cancellationToken)
            ?? throw new KeyNotFoundException("Cart item not found.");

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ClearCartAsync(int userId, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);

        var items = await _context.CartItems
            .Where(ci => ci.CartID == cart.CartID)
            .ToListAsync(cancellationToken);

        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<Cart> GetOrCreateCartAsync(int userId, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts
            .FirstOrDefaultAsync(c => c.UserID == userId, cancellationToken);

        if (cart == null)
        {
            cart = new Cart
            {
                UserID = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return cart;
    }
}
