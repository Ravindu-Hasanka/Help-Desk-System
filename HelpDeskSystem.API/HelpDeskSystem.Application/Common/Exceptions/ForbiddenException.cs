namespace HelpDeskSystem.Application.Common.Exceptions;

public sealed class ForbiddenException(string message) : AppException(message, 403);
