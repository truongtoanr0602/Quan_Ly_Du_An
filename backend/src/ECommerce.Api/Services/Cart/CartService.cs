using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Cart;
using ECommerce.Api.Entities;
using ECommerce.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Cart;

public sealed class CartService(AppDbContext context) : ICartService
{
    public async Task<CartDto> GetAsync(int userId, CancellationToken ct = default)
    {
        var cart = await LoadCartAsync(userId, false, ct);
        return cart is null ? EmptyCart() : ToDto(cart);
    }

    public async Task<CartDto> AddAsync(int userId, AddCartItemDto dto, CancellationToken ct = default)
    {
        var product = await GetAvailableProductAsync(dto.ProductID, ct);
        ValidateQuantity(dto.Quantity, product.StockQuantity);

        var cart = await LoadCartAsync(userId, true, ct);
        if (cart is null)
        {
            cart = new Entities.Cart { UserID = userId, CreatedAt = DateTime.UtcNow };
            context.Carts.Add(cart);
        }

        var item = cart.Items.SingleOrDefault(candidate => candidate.ProductID == product.ProductID);
        var quantity = (item?.Quantity ?? 0) + dto.Quantity;
        ValidateQuantity(quantity, product.StockQuantity);

        if (item is null)
        {
            cart.Items.Add(new CartItem
            {
                ProductID = product.ProductID,
                Product = product,
                Quantity = quantity,
                AddedAt = DateTime.UtcNow
            });
        }
        else
        {
            item.Quantity = quantity;
            item.UpdatedAt = DateTime.UtcNow;
        }

        try
        {
            await context.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            throw new DomainConflictException();
        }

        return ToDto(cart);
    }

    public async Task<CartDto> UpdateAsync(
        int userId,
        int productId,
        UpdateCartItemDto dto,
        CancellationToken ct = default)
    {
        var product = await GetAvailableProductAsync(productId, ct);
        ValidateQuantity(dto.Quantity, product.StockQuantity);
        var cart = await LoadCartAsync(userId, true, ct);
        var item = cart?.Items.SingleOrDefault(candidate => candidate.ProductID == productId)
            ?? throw new ResourceNotFoundException();

        item.Quantity = dto.Quantity;
        item.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);
        return ToDto(cart!);
    }

    public async Task RemoveAsync(int userId, int productId, CancellationToken ct = default)
    {
        var cart = await LoadCartAsync(userId, true, ct);
        var item = cart?.Items.SingleOrDefault(candidate => candidate.ProductID == productId)
            ?? throw new ResourceNotFoundException();

        context.CartItems.Remove(item);
        await context.SaveChangesAsync(ct);
    }

    public async Task ClearAsync(int userId, CancellationToken ct = default)
    {
        var cart = await LoadCartAsync(userId, true, ct);
        if (cart is null || cart.Items.Count == 0) return;

        context.CartItems.RemoveRange(cart.Items);
        await context.SaveChangesAsync(ct);
    }

    private Task<Entities.Cart?> LoadCartAsync(int userId, bool tracked, CancellationToken ct)
    {
        IQueryable<Entities.Cart> query = context.Carts
            .Include(cart => cart.Items)
            .ThenInclude(item => item.Product)
            .ThenInclude(product => product.Images);

        if (!tracked) query = query.AsNoTracking();
        return query.SingleOrDefaultAsync(cart => cart.UserID == userId, ct);
    }

    private async Task<Product> GetAvailableProductAsync(int productId, CancellationToken ct)
    {
        return await context.Products
            .Include(product => product.Images)
            .SingleOrDefaultAsync(product => product.ProductID == productId && product.IsActive, ct)
            ?? throw new ResourceNotFoundException();
    }

    private static void ValidateQuantity(int quantity, int stock)
    {
        if (quantity <= 0 || quantity > stock) throw new DomainValidationException();
    }

    private static CartDto EmptyCart() => new([], 0, 0m);

    private static CartDto ToDto(Entities.Cart cart)
    {
        var items = cart.Items
            .OrderBy(item => item.AddedAt)
            .Select(item =>
            {
                var price = item.Product.Price;
                var image = item.Product.Images
                    .OrderByDescending(candidate => candidate.IsPrimary)
                    .ThenBy(candidate => candidate.DisplayOrder)
                    .Select(candidate => candidate.ImageURL)
                    .FirstOrDefault();
                return new CartItemDto(
                    item.ProductID,
                    item.Product.ProductName,
                    item.Product.SKU,
                    price,
                    item.Quantity,
                    item.Product.StockQuantity,
                    image,
                    price * item.Quantity);
            })
            .ToArray();

        return new CartDto(items, items.Sum(item => item.Quantity), items.Sum(item => item.LineTotal));
    }
}
