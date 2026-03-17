using HelpDeskSystem.Application.Common.Interfaces;
using HelpDeskSystem.Application.Common.Models;
using HelpDeskSystem.Application.DTOs.Dashboard;
using HelpDeskSystem.Application.DTOs.Tickets;
using HelpDeskSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskSystem.Infrastructure.Services;

public sealed class DashboardService(HelpDeskDbConn dbContext) : IDashboardService
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(CurrentUserContext currentUser, CancellationToken cancellationToken)
    {
        var baseQuery = dbContext.Tickets
            .AsNoTracking()
            .Include(ticket => ticket.Status)
            .Include(ticket => ticket.Priority)
            .Include(ticket => ticket.Category)
            .Include(ticket => ticket.CreatedByUser)
            .Include(ticket => ticket.AssignedToUser)
            .AsQueryable();

        if (currentUser.IsRequester)
        {
            baseQuery = baseQuery.Where(ticket => ticket.CreatedByUserId == currentUser.UserId);
        }

        var totalTickets = await baseQuery.CountAsync(cancellationToken);
        var openTickets = await baseQuery.CountAsync(ticket => ticket.StatusId == SeedDataIds.OpenStatusId, cancellationToken);
        var inProgressTickets = await baseQuery.CountAsync(ticket => ticket.StatusId == SeedDataIds.InProgressStatusId, cancellationToken);
        var resolvedTickets = await baseQuery.CountAsync(ticket => ticket.StatusId == SeedDataIds.ResolvedStatusId, cancellationToken);
        var closedTickets = await baseQuery.CountAsync(ticket => ticket.StatusId == SeedDataIds.ClosedStatusId, cancellationToken);
        var unassignedTickets = await baseQuery.CountAsync(ticket => ticket.AssignedToUserId == null, cancellationToken);

        var statusBreakdown = await baseQuery
            .GroupBy(ticket => new { ticket.StatusId, ticket.Status.StatusName })
            .Select(group => new DashboardBreakdownDto
            {
                Id = group.Key.StatusId,
                Name = group.Key.StatusName,
                Count = group.Count()
            })
            .OrderBy(item => item.Id)
            .ToListAsync(cancellationToken);

        var priorityBreakdown = await baseQuery
            .GroupBy(ticket => new { ticket.PriorityId, ticket.Priority.PriorityName })
            .Select(group => new DashboardBreakdownDto
            {
                Id = group.Key.PriorityId,
                Name = group.Key.PriorityName,
                Count = group.Count()
            })
            .OrderBy(item => item.Id)
            .ToListAsync(cancellationToken);

        var recentTickets = await baseQuery
            .OrderByDescending(ticket => ticket.CreatedAt)
            .Take(5)
            .Select(ticket => new TicketSummaryDto
            {
                TicketId = ticket.TicketId,
                TicketNumber = ticket.TicketNumber,
                Title = ticket.Title,
                CategoryName = ticket.Category.CategoryName,
                PriorityName = ticket.Priority.PriorityName,
                StatusName = ticket.Status.StatusName,
                CreatedByUserName = ticket.CreatedByUser.Name,
                AssignedToUserName = ticket.AssignedToUser != null ? ticket.AssignedToUser.Name : null,
                CreatedAt = ticket.CreatedAt,
                DueDate = ticket.DueDate
            })
            .ToListAsync(cancellationToken);

        return new DashboardSummaryDto
        {
            TotalTickets = totalTickets,
            OpenTickets = openTickets,
            InProgressTickets = inProgressTickets,
            ResolvedTickets = resolvedTickets,
            ClosedTickets = closedTickets,
            UnassignedTickets = unassignedTickets,
            StatusBreakdown = statusBreakdown,
            PriorityBreakdown = priorityBreakdown,
            RecentTickets = recentTickets
        };
    }
}
