namespace ECommerce.Api.Entities;

public class RefreshToken
{
    public long RefreshTokenID { get; set; }

    public int UserID { get; set; }

    public string Token { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
