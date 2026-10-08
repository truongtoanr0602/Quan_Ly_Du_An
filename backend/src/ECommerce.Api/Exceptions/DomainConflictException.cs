namespace ECommerce.Api.Exceptions;

public sealed class DomainConflictException() : Exception("The request conflicts with existing state.");
