using ECommerce.Api.DTOs.Carts;

namespace ECommerce.Api.Services.Carts;

public interface ICartService
{
    Task<CartDto> GetCartAsync(int userId, CancellationToken cancellationToken = default);
    Task<CartDto> AddItemAsync(int userId, AddCartItemDto dto, CancellationToken cancellationToken = default);
    Task<CartDto> UpdateItemQuantityAsync(int userId, long cartItemId, UpdateCartItemDto dto, CancellationToken cancellationToken = default);
    Task RemoveItemAsync(int userId, long cartItemId, CancellationToken cancellationToken = default);
    Task ClearCartAsync(int userId, CancellationToken cancellationToken = default);
}
