namespace HelpDeskSystem.Application.DTOs.Dashboard;

public sealed class DashboardBreakdownDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public int Count { get; init; }
}
