using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Chat;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services.Chat;

public class ChatService : IChatService
{
    private readonly AppDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly ILogger<ChatService> _logger;

    private const string GeminiEndpoint =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

    public ChatService(
        AppDbContext context,
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ChatService> logger)
    {
        _context = context;
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"];
        _logger = logger;
    }

    public async Task<ChatResponseDto> ChatAsync(ChatRequestDto request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return new ChatResponseDto(
                "Xin lỗi, tính năng trợ lý AI đang được cấu hình. Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
                null);
        }

        // 1. Extract keywords from user message for product search
        var keywords = ExtractKeywords(request.Message);

        // 2. Query relevant products from database
        var productContext = await BuildProductContextAsync(keywords, request.Message, cancellationToken);

        // 3. Build the Gemini API request with system prompt + product data + conversation history
        var geminiRequest = BuildGeminiRequest(request.Message, request.History, productContext);

        // 4. Call Gemini API
        try
        {
            var url = $"{GeminiEndpoint}?key={_apiKey}";
            var jsonPayload = JsonSerializer.Serialize(geminiRequest, _jsonOptions);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, content, cancellationToken);
            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Gemini API error: {StatusCode} {Body}", response.StatusCode, responseBody);
                return new ChatResponseDto(
                    "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
                    null);
            }

            // 5. Parse Gemini response
            var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseBody, _jsonOptions);
            var replyText = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text
                            ?? "Xin lỗi, tôi không thể trả lời lúc này.";

            // 6. Extract recommended product IDs from the reply and build product cards
            var recommendedProducts = await ExtractRecommendedProductsAsync(replyText, keywords, cancellationToken);

            return new ChatResponseDto(replyText, recommendedProducts);
        }
        catch (TaskCanceledException)
        {
            return new ChatResponseDto(
                "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.",
                null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error calling Gemini API");
            return new ChatResponseDto(
                "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.",
                null);
        }
    }

    // ───── Helper Methods ─────

    private static List<string> ExtractKeywords(string message)
    {
        // Simple keyword extraction: split by common separators, filter short/stop words
        var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "và", "hoặc", "hay", "của", "cho", "với", "trong", "này", "đó", "là", "có",
            "không", "được", "một", "các", "những", "tôi", "bạn", "mình", "cái", "nào",
            "gì", "sao", "thì", "nhưng", "vì", "nên", "đã", "sẽ", "đang", "rất", "quá",
            "hơn", "nhất", "cũng", "vẫn", "còn", "muốn", "cần", "nếu", "khi", "mà",
            "để", "the", "and", "or", "is", "a", "an", "to", "for", "of", "in", "on",
            "tìm", "kiếm", "giúp", "xin", "hãy", "lựa", "chọn", "gợi", "ý", "đề", "xuất",
            "so", "sánh", "giữa", "về"
        };

        return message
            .Split(new[] { ' ', ',', '.', '!', '?', ';', ':', '-', '(', ')', '[', ']' },
                   StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(w => w.Length >= 2 && !stopWords.Contains(w))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(10)
            .ToList();
    }

    private async Task<string> BuildProductContextAsync(
        List<string> keywords,
        string originalMessage,
        CancellationToken cancellationToken)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => p.IsActive)
            .AsNoTracking();

        // Build keyword filter: match against ProductName, Description, Category, Brand
        if (keywords.Count > 0)
        {
            query = query.Where(p =>
                keywords.Any(k =>
                    p.ProductName.Contains(k) ||
                    (p.Description != null && p.Description.Contains(k)) ||
                    p.Category.CategoryName.Contains(k) ||
                    p.Brand.BrandName.Contains(k) ||
                    p.SKU.Contains(k)
                )
            );
        }

        // Try price extraction from original message (e.g., "dưới 20 triệu", "từ 5 đến 10 triệu")
        var (minPrice, maxPrice) = ExtractPriceRange(originalMessage);
        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);
        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        var products = await query
            .OrderByDescending(p => p.StockQuantity)
            .Take(15) // Limit to top 15 relevant products to keep context manageable
            .Select(p => new
            {
                p.ProductID,
                p.ProductName,
                p.SKU,
                p.Description,
                p.Price,
                p.StockQuantity,
                CategoryName = p.Category.CategoryName,
                BrandName = p.Brand.BrandName,
                ImageUrl = p.Images.Where(i => i.IsPrimary).Select(i => i.ImageURL).FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        if (products.Count == 0)
        {
            // Fallback: get some popular products
            products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Where(p => p.IsActive && p.StockQuantity > 0)
                .AsNoTracking()
                .OrderByDescending(p => p.StockQuantity)
                .Take(10)
                .Select(p => new
                {
                    p.ProductID,
                    p.ProductName,
                    p.SKU,
                    p.Description,
                    p.Price,
                    p.StockQuantity,
                    CategoryName = p.Category.CategoryName,
                    BrandName = p.Brand.BrandName,
                    ImageUrl = p.Images.Where(i => i.IsPrimary).Select(i => i.ImageURL).FirstOrDefault()
                })
                .ToListAsync(cancellationToken);
        }

        var sb = new StringBuilder();
        sb.AppendLine("=== DANH SÁCH SẢN PHẨM TRONG CỬA HÀNG ELECTROTECH ===");
        foreach (var p in products)
        {
            sb.AppendLine($"[ID:{p.ProductID}] {p.ProductName}");
            sb.AppendLine($"  Thương hiệu: {p.BrandName} | Danh mục: {p.CategoryName}");
            sb.AppendLine($"  Giá: {p.Price:N0} VNĐ | Tồn kho: {p.StockQuantity}");
            if (!string.IsNullOrWhiteSpace(p.Description))
                sb.AppendLine($"  Mô tả: {p.Description[..Math.Min(200, p.Description.Length)]}");
            sb.AppendLine();
        }

        return sb.ToString();
    }

    private static (decimal? min, decimal? max) ExtractPriceRange(string message)
    {
        decimal? min = null, max = null;
        var lower = message.ToLowerInvariant();

        // Pattern: "dưới X triệu" or "< X triệu"
        var belowMatch = System.Text.RegularExpressions.Regex.Match(lower, @"(dưới|under|<)\s*(\d+[\.,]?\d*)\s*(triệu|tr)");
        if (belowMatch.Success && decimal.TryParse(belowMatch.Groups[2].Value.Replace(',', '.'), out var belowVal))
            max = belowVal * 1_000_000;

        // Pattern: "trên X triệu" or "> X triệu"
        var aboveMatch = System.Text.RegularExpressions.Regex.Match(lower, @"(trên|trở lên|above|>)\s*(\d+[\.,]?\d*)\s*(triệu|tr)");
        if (aboveMatch.Success && decimal.TryParse(aboveMatch.Groups[2].Value.Replace(',', '.'), out var aboveVal))
            min = aboveVal * 1_000_000;

        // Pattern: "từ X đến Y triệu"
        var rangeMatch = System.Text.RegularExpressions.Regex.Match(lower, @"từ\s*(\d+[\.,]?\d*)\s*(đến|tới|-)\s*(\d+[\.,]?\d*)\s*(triệu|tr)");
        if (rangeMatch.Success)
        {
            if (decimal.TryParse(rangeMatch.Groups[1].Value.Replace(',', '.'), out var rangeMin))
                min = rangeMin * 1_000_000;
            if (decimal.TryParse(rangeMatch.Groups[3].Value.Replace(',', '.'), out var rangeMax))
                max = rangeMax * 1_000_000;
        }

        // Pattern: "X triệu" standalone (interpret as approximate max)
        if (min == null && max == null)
        {
            var simpleMatch = System.Text.RegularExpressions.Regex.Match(lower, @"(\d+[\.,]?\d*)\s*(triệu|tr)");
            if (simpleMatch.Success && decimal.TryParse(simpleMatch.Groups[1].Value.Replace(',', '.'), out var simpleVal))
            {
                // If context suggests a budget, use as max
                if (lower.Contains("tầm") || lower.Contains("khoảng") || lower.Contains("budget"))
                {
                    min = simpleVal * 1_000_000 * 0.8m;
                    max = simpleVal * 1_000_000 * 1.2m;
                }
            }
        }

        return (min, max);
    }

    private static object BuildGeminiRequest(
        string userMessage,
        List<ChatMessageDto>? history,
        string productContext)
    {
        var systemInstruction = $@"Bạn là trợ lý tư vấn mua sắm AI của cửa hàng điện tử ElectroTech. Nhiệm vụ của bạn:

1. **Gợi ý sản phẩm**: Đề xuất sản phẩm phù hợp dựa trên nhu cầu, ngân sách và sở thích của khách hàng.
2. **So sánh sản phẩm**: Khi khách yêu cầu so sánh, hãy tạo bảng so sánh rõ ràng với các tiêu chí: giá, cấu hình, ưu/nhược điểm.
3. **Tư vấn chuyên nghiệp**: Giải thích thông số kỹ thuật bằng ngôn ngữ dễ hiểu.

QUY TẮC BẮT BUỘC:
- CHỈ gợi ý sản phẩm có trong danh sách dữ liệu bên dưới. KHÔNG bịa sản phẩm không tồn tại.
- Khi đề cập sản phẩm, LUÔN ghi kèm [ID:xxx] để hệ thống hiển thị link sản phẩm.
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.
- Nếu sản phẩm hết hàng (tồn kho = 0), hãy thông báo cho khách và gợi ý sản phẩm thay thế.
- Định dạng giá bằng VNĐ (ví dụ: 25.990.000 VNĐ).
- Giữ câu trả lời ngắn gọn, tập trung, không quá 300 từ.

DỮ LIỆU SẢN PHẨM HIỆN CÓ:
{productContext}";

        // Build conversation contents
        var contents = new List<object>();

        // Add conversation history (up to last 20 messages)
        if (history != null)
        {
            foreach (var msg in history.TakeLast(20))
            {
                contents.Add(new
                {
                    role = msg.Role == "assistant" ? "model" : "user",
                    parts = new[] { new { text = msg.Content } }
                });
            }
        }

        // Add current user message
        contents.Add(new
        {
            role = "user",
            parts = new[] { new { text = userMessage } }
        });

        return new
        {
            system_instruction = new
            {
                parts = new[] { new { text = systemInstruction } }
            },
            contents,
            generationConfig = new
            {
                temperature = 0.7,
                topP = 0.9,
                maxOutputTokens = 1024
            }
        };
    }

    private async Task<List<RecommendedProductDto>?> ExtractRecommendedProductsAsync(
        string replyText,
        List<string> keywords,
        CancellationToken cancellationToken)
    {
        // Extract product IDs mentioned in the reply (format: [ID:123])
        var idMatches = System.Text.RegularExpressions.Regex.Matches(replyText, @"\[ID:(\d+)\]");
        var productIds = idMatches
            .Select(m => int.TryParse(m.Groups[1].Value, out var id) ? id : 0)
            .Where(id => id > 0)
            .Distinct()
            .Take(5)
            .ToList();

        if (productIds.Count == 0)
            return null;

        var products = await _context.Products
            .Include(p => p.Images)
            .AsNoTracking()
            .Where(p => productIds.Contains(p.ProductID))
            .Select(p => new RecommendedProductDto(
                p.ProductID,
                p.ProductName,
                p.Price,
                p.Images.Where(i => i.IsPrimary).Select(i => i.ImageURL).FirstOrDefault(),
                null
            ))
            .ToListAsync(cancellationToken);

        return products.Count > 0 ? products : null;
    }

    // ───── JSON Serialization Options ─────

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    // ───── Gemini Response DTOs ─────

    private record GeminiResponse(List<GeminiCandidate>? Candidates);
    private record GeminiCandidate(GeminiContent? Content);
    private record GeminiContent(List<GeminiPart>? Parts);
    private record GeminiPart(string? Text);
}
