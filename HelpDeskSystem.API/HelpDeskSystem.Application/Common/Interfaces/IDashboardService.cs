using HelpDeskSystem.Application.Common.Models;
using HelpDeskSystem.Application.DTOs.Dashboard;

namespace HelpDeskSystem.Application.Common.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(CurrentUserContext currentUser, CancellationToken cancellationToken);
}
