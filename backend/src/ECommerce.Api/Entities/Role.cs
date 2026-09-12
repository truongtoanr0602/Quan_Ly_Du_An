namespace ECommerce.Api.Entities;

public class Role
{
    public int RoleID { get; set; }

    public string RoleName { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation
    public ICollection<User> Users { get; set; } = new List<User>();
}
