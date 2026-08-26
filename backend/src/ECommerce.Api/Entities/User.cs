namespace ECommerce.Api.Entities;


public class User
{
    public int UserID { get; set; }

    public int RoleID { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string? Phone { get; set; }

    public string? AvatarURL { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public Role Role { get; set; } = null!;
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
    public Cart? Cart { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
