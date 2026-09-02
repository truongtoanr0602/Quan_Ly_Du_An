namespace ECommerce.Api.DTOs.Profile;

public sealed record ProfileDto(
    int UserID,
    string Email,
    string FullName,
    string? Phone,
    string? AvatarURL);
