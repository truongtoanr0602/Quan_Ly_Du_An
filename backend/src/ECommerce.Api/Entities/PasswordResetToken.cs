namespace ECommerce.Api.Entities;


public class PasswordResetToken
{
    public long PasswordResetTokenID { get; set; }

    public int UserID { get; set; }

    public string Token { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public DateTime? UsedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
