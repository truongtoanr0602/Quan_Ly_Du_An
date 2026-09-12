namespace ECommerce.Api.DTOs.Chat;

public record ChatRequestDto(string Message, List<ChatMessageDto>? History);

public record ChatMessageDto(string Role, string Content);

public record ChatResponseDto(string Reply, List<RecommendedProductDto>? Products);

public record RecommendedProductDto(
    int ProductId,
    string ProductName,
    decimal Price,
    string? ImageUrl,
    string? Reason
);
