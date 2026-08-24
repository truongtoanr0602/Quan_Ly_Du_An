namespace ECommerce.Api.Services;

/// <summary>
/// Outcome of a business operation. Services return an outcome; Controllers translate it into HTTP.
/// </summary>
public enum ServiceStatus
{
    Success,
    Invalid,
    NotFound,
    Conflict
}

public sealed record ServiceResult(
    ServiceStatus Status,
    string? Detail = null,
    IReadOnlyDictionary<string, string[]>? Errors = null)
{
    public static ServiceResult Success() => new(ServiceStatus.Success);

    public static ServiceResult Invalid(IReadOnlyDictionary<string, string[]> errors) =>
        new(ServiceStatus.Invalid, Errors: errors);

    public static ServiceResult NotFound(string detail) => new(ServiceStatus.NotFound, detail);

    public static ServiceResult Conflict(string detail) => new(ServiceStatus.Conflict, detail);
}

public sealed record ServiceResult<TValue>(
    ServiceStatus Status,
    TValue? Value = default,
    string? Detail = null,
    IReadOnlyDictionary<string, string[]>? Errors = null)
{
    public static ServiceResult<TValue> Success(TValue value) => new(ServiceStatus.Success, value);

    public static ServiceResult<TValue> Invalid(IReadOnlyDictionary<string, string[]> errors) =>
        new(ServiceStatus.Invalid, Errors: errors);

    public static ServiceResult<TValue> NotFound(string detail) => new(ServiceStatus.NotFound, Detail: detail);

    public static ServiceResult<TValue> Conflict(string detail) => new(ServiceStatus.Conflict, Detail: detail);
}
