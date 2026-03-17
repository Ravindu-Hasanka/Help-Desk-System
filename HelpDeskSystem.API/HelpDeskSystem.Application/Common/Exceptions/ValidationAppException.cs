namespace HelpDeskSystem.Application.Common.Exceptions;

public sealed class ValidationAppException(string message) : AppException(message, 400);
