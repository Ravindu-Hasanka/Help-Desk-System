namespace HelpDeskSystem.Application.DTOs.Lookup;

public sealed class LookupDataDto
{
    public required IReadOnlyList<LookupItemDto> Roles { get; init; }
    public required IReadOnlyList<LookupItemDto> Categories { get; init; }
    public required IReadOnlyList<LookupItemDto> Priorities { get; init; }
    public required IReadOnlyList<LookupItemDto> Statuses { get; init; }
}
