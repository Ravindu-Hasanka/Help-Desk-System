namespace HelpDeskSystem.Application.DTOs.Lookup;

public sealed class LookupItemDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int? DisplayOrder { get; init; }
    public bool IsClosedStatus { get; init; }
}
