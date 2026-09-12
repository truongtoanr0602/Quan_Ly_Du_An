using ECommerce.Api.DTOs.Chat;
using ECommerce.Api.Services.Chat;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    /// <summary>
    /// Send a message to the AI shopping assistant.
    /// The assistant uses store product data to recommend and compare products.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ChatResponseDto>> Chat(
        [FromBody] ChatRequestDto request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { title = "Tin nhắn không được để trống." });

        var response = await _chatService.ChatAsync(request, cancellationToken);
        return Ok(response);
    }
}
