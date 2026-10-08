using ECommerce.Api.DTOs.Chat;

namespace ECommerce.Api.Services.Chat;

public interface IChatService
{
    Task<ChatResponseDto> ChatAsync(ChatRequestDto request, CancellationToken cancellationToken = default);
}
