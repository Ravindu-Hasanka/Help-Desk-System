using HelpDeskSystem.Application.Common.Exceptions;
using HelpDeskSystem.Application.Common.Interfaces;
using HelpDeskSystem.Application.Common.Models;
using HelpDeskSystem.Application.DTOs.Tickets;
using HelpDeskSystem.Domain.Entities;
using HelpDeskSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskSystem.Infrastructure.Services;

public sealed class TicketService(HelpDeskDbConn dbContext) : ITicketService
{
    public async Task<PagedResult<TicketSummaryDto>> GetTicketsAsync(TicketQueryParameters query, CurrentUserContext currentUser, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(1, query.PageNumber);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var ticketsQuery = ApplyVisibilityFilter(dbContext.Tickets.AsNoTracking(), currentUser)
            .Include(ticket => ticket.Category)
            .Include(ticket => ticket.Priority)
            .Include(ticket => ticket.Status)
            .Include(ticket => ticket.CreatedByUser)
            .Include(ticket => ticket.AssignedToUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            ticketsQuery = ticketsQuery.Where(ticket =>
                ticket.TicketNumber.ToLower().Contains(search) ||
                ticket.Title.ToLower().Contains(search) ||
                ticket.Description.ToLower().Contains(search));
        }

        if (query.CategoryId.HasValue)
        {
            ticketsQuery = ticketsQuery.Where(ticket => ticket.CategoryId == query.CategoryId.Value);
        }

        if (query.PriorityId.HasValue)
        {
            ticketsQuery = ticketsQuery.Where(ticket => ticket.PriorityId == query.PriorityId.Value);
        }

        if (query.StatusId.HasValue)
        {
            ticketsQuery = ticketsQuery.Where(ticket => ticket.StatusId == query.StatusId.Value);
        }

        if (query.AssignedToUserId.HasValue)
        {
            ticketsQuery = ticketsQuery.Where(ticket => ticket.AssignedToUserId == query.AssignedToUserId.Value);
        }

        if (query.CreatedByUserId.HasValue)
        {
            ticketsQuery = ticketsQuery.Where(ticket => ticket.CreatedByUserId == query.CreatedByUserId.Value);
        }

        if (!query.IncludeClosed)
        {
            ticketsQuery = ticketsQuery.Where(ticket => !ticket.Status.IsClosedStatus);
        }

        var totalCount = await ticketsQuery.CountAsync(cancellationToken);
        var tickets = await ticketsQuery
            .OrderByDescending(ticket => ticket.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<TicketSummaryDto>
        {
            Items = tickets.Select(MapTicketSummary).ToList(),
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<TicketDetailDto> GetTicketByIdAsync(int ticketId, CurrentUserContext currentUser, CancellationToken cancellationToken)
    {
        var ticket = await GetVisibleTicketQuery(currentUser)
            .FirstOrDefaultAsync(candidate => candidate.TicketId == ticketId, cancellationToken)
            ?? throw new NotFoundException("Ticket not found.");

        return MapTicketDetail(ticket, currentUser.CanManageTickets);
    }

    public async Task<TicketDetailDto> CreateTicketAsync(CreateTicketRequest request, CurrentUserContext currentUser, CancellationToken cancellationToken)
    {
        await EnsureReferenceDataAsync(request.CategoryId, request.PriorityId, request.AssignedToUserId, cancellationToken);

        var ticket = new Ticket
        {
            TicketNumber = CreateTicketNumber(),
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            CategoryId = request.CategoryId,
            PriorityId = request.PriorityId,
            StatusId = SeedDataIds.OpenStatusId,
            CreatedByUserId = currentUser.UserId,
            AssignedToUserId = request.AssignedToUserId,
            DueDate = request.DueDate?.ToUniversalTime(),
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        dbContext.Tickets.Add(ticket);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetTicketByIdAsync(ticket.TicketId, currentUser, cancellationToken);
    }

    public async Task<TicketDetailDto> UpdateTicketAsync(int ticketId, UpdateTicketRequest request, CurrentUserContext currentUser, CancellationToken cancellationToken)
    {
        EnsureTicketManager(currentUser);

        var ticket = await dbContext.Tickets.FirstOrDefaultAsync(candidate => candidate.TicketId == ticketId, cancellationToken)
            ?? throw new NotFoundException("Ticket not found.");

        await EnsureReferenceDataAsync(request.CategoryId, request.PriorityId, request.AssignedToUserId, cancellationToken);
        var status = await dbContext.Statuses.FirstOrDefaultAsync(candidate => candidate.StatusId == request.StatusId, cancellationToken)
            ?? throw new ValidationAppException("The selected status does not exist.");

        ticket.Title = request.Title.Trim();
        ticket.Description = request.Description.Trim();
        ticket.CategoryId = request.CategoryId;
        ticket.PriorityId = request.PriorityId;
        ticket.StatusId = request.StatusId;
        ticket.AssignedToUserId = request.AssignedToUserId;
        ticket.DueDate = request.DueDate?.ToUniversalTime();
        ticket.UpdatedAt = DateTime.UtcNow;

        UpdateLifecycleDates(ticket, status);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetTicketByIdAsync(ticketId, currentUser, cancellationToken);
    }

    public async Task<TicketDetailDto> AssignTicketAsync(int ticketId, AssignTicketRequest request, CurrentUserContext currentUser, CancellationToken cancellationToken)
    {
        EnsureTicketManager(currentUser);

        var ticket = await dbContext.Tickets.FirstOrDefaultAsync(candidate => candidate.TicketId == ticketId, cancellationToken)
            ?? throw new NotFoundException("Ticket not found.");

        if (request.AssignedToUserId.HasValue)
        {
            var assignedUserExists = await dbContext.Users.AnyAsync(user => user.UserId == request.AssignedToUserId.Value && user.IsActive, cancellationToken);
            if (!assignedUserExists)
            {
                throw new ValidationAppException("The selected assignee does not exist or is inactive.");
            }
        }

        ticket.AssignedToUserId = request.AssignedToUserId;
        ticket.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetTicketByIdAsync(ticketId, currentUser, cancellationToken);
    }

    public async Task<TicketDetailDto> UpdateStatusAsync(int ticketId, UpdateTicketStatusRequest request, CurrentUserContext currentUser, CancellationToken cancellationToken)
    {
        EnsureTicketManager(currentUser);

        var ticket = await dbContext.Tickets.FirstOrDefaultAsync(candidate => candidate.TicketId == ticketId, cancellationToken)
            ?? throw new NotFoundException("Ticket not found.");

        var status = await dbContext.Statuses.FirstOrDefaultAsync(candidate => candidate.StatusId == request.StatusId, cancellationToken)
            ?? throw new ValidationAppException("The selected status does not exist.");

        ticket.StatusId = request.StatusId;
        ticket.UpdatedAt = DateTime.UtcNow;
        UpdateLifecycleDates(ticket, status);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetTicketByIdAsync(ticketId, currentUser, cancellationToken);
    }

    public async Task<IReadOnlyList<TicketCommentDto>> GetCommentsAsync(int ticketId, CurrentUserContext currentUser, CancellationToken cancellationToken)
    {
        await EnsureTicketVisibleAsync(ticketId, currentUser, cancellationToken);

        return await dbContext.TicketComments
            .AsNoTracking()
            .Include(comment => comment.User)
            .Where(comment => comment.TicketId == ticketId)
            .Where(comment => currentUser.CanManageTickets || !comment.IsInternalNote)
            .OrderBy(comment => comment.CreatedAt)
            .Select(comment => new TicketCommentDto
            {
                CommentId = comment.CommentId,
                TicketId = comment.TicketId,
                UserId = comment.UserId,
                UserName = comment.User.Name,
                CommentText = comment.CommentText,
                IsInternalNote = comment.IsInternalNote,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<TicketCommentDto> AddCommentAsync(int ticketId, AddTicketCommentRequest request, CurrentUserContext currentUser, CancellationToken cancellationToken)
    {
        await EnsureTicketVisibleAsync(ticketId, currentUser, cancellationToken);

        if (request.IsInternalNote && !currentUser.CanManageTickets)
        {
            throw new ForbiddenException("Only support staff can add internal notes.");
        }

        var comment = new TicketComment
        {
            TicketId = ticketId,
            UserId = currentUser.UserId,
            CommentText = request.CommentText.Trim(),
            IsInternalNote = request.IsInternalNote,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.TicketComments.Add(comment);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await dbContext.TicketComments
            .AsNoTracking()
            .Include(entry => entry.User)
            .Where(entry => entry.CommentId == comment.CommentId)
            .Select(entry => new TicketCommentDto
            {
                CommentId = entry.CommentId,
                TicketId = entry.TicketId,
                UserId = entry.UserId,
                UserName = entry.User.Name,
                CommentText = entry.CommentText,
                IsInternalNote = entry.IsInternalNote,
                CreatedAt = entry.CreatedAt,
                UpdatedAt = entry.UpdatedAt
            })
            .FirstAsync(cancellationToken);
    }

    private IQueryable<Ticket> GetVisibleTicketQuery(CurrentUserContext currentUser) =>
        ApplyVisibilityFilter(dbContext.Tickets.AsNoTracking(), currentUser)
            .Include(ticket => ticket.Category)
            .Include(ticket => ticket.Priority)
            .Include(ticket => ticket.Status)
            .Include(ticket => ticket.CreatedByUser)
            .Include(ticket => ticket.AssignedToUser)
            .Include(ticket => ticket.Comments)
            .ThenInclude(comment => comment.User);

    private static IQueryable<Ticket> ApplyVisibilityFilter(IQueryable<Ticket> query, CurrentUserContext currentUser)
    {
        if (currentUser.IsRequester)
        {
            return query.Where(ticket => ticket.CreatedByUserId == currentUser.UserId);
        }

        return query;
    }

    private async Task EnsureTicketVisibleAsync(int ticketId, CurrentUserContext currentUser, CancellationToken cancellationToken)
    {
        var exists = await ApplyVisibilityFilter(dbContext.Tickets.AsNoTracking(), currentUser)
            .AnyAsync(ticket => ticket.TicketId == ticketId, cancellationToken);

        if (!exists)
        {
            throw new NotFoundException("Ticket not found.");
        }
    }

    private async Task EnsureReferenceDataAsync(int categoryId, int priorityId, int? assignedToUserId, CancellationToken cancellationToken)
    {
        var categoryExists = await dbContext.Categories.AnyAsync(category => category.CategoryId == categoryId && category.IsActive, cancellationToken);
        var priorityExists = await dbContext.Priorities.AnyAsync(priority => priority.PriorityId == priorityId, cancellationToken);

        if (!categoryExists)
        {
            throw new ValidationAppException("The selected category does not exist.");
        }

        if (!priorityExists)
        {
            throw new ValidationAppException("The selected priority does not exist.");
        }

        if (assignedToUserId.HasValue)
        {
            var assignedUserExists = await dbContext.Users.AnyAsync(user => user.UserId == assignedToUserId.Value && user.IsActive, cancellationToken);
            if (!assignedUserExists)
            {
                throw new ValidationAppException("The selected assignee does not exist or is inactive.");
            }
        }
    }

    private static void EnsureTicketManager(CurrentUserContext currentUser)
    {
        if (!currentUser.CanManageTickets)
        {
            throw new ForbiddenException("Only support staff can manage tickets.");
        }
    }

    private static void UpdateLifecycleDates(Ticket ticket, Status status)
    {
        if (status.StatusId == SeedDataIds.ResolvedStatusId)
        {
            ticket.ResolvedAt ??= DateTime.UtcNow;
            ticket.ClosedAt = null;
            return;
        }

        if (status.StatusId == SeedDataIds.ClosedStatusId)
        {
            ticket.ResolvedAt ??= DateTime.UtcNow;
            ticket.ClosedAt ??= DateTime.UtcNow;
            return;
        }

        ticket.ResolvedAt = null;
        ticket.ClosedAt = null;
    }

    private static string CreateTicketNumber()
    {
        var suffix = Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
        return $"HD-{DateTime.UtcNow:yyyyMMdd}-{suffix}";
    }

    private static TicketSummaryDto MapTicketSummary(Ticket ticket)
    {
        return new TicketSummaryDto
        {
            TicketId = ticket.TicketId,
            TicketNumber = ticket.TicketNumber,
            Title = ticket.Title,
            CategoryName = ticket.Category.CategoryName,
            PriorityName = ticket.Priority.PriorityName,
            StatusName = ticket.Status.StatusName,
            CreatedByUserName = ticket.CreatedByUser.Name,
            AssignedToUserName = ticket.AssignedToUser?.Name,
            CreatedAt = ticket.CreatedAt,
            DueDate = ticket.DueDate
        };
    }

    private static TicketDetailDto MapTicketDetail(Ticket ticket, bool includeInternalNotes)
    {
        var comments = ticket.Comments
            .Where(comment => includeInternalNotes || !comment.IsInternalNote)
            .OrderBy(comment => comment.CreatedAt)
            .Select(comment => new TicketCommentDto
            {
                CommentId = comment.CommentId,
                TicketId = comment.TicketId,
                UserId = comment.UserId,
                UserName = comment.User.Name,
                CommentText = comment.CommentText,
                IsInternalNote = comment.IsInternalNote,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt
            })
            .ToList();

        return new TicketDetailDto
        {
            TicketId = ticket.TicketId,
            TicketNumber = ticket.TicketNumber,
            Title = ticket.Title,
            Description = ticket.Description,
            CategoryId = ticket.CategoryId,
            CategoryName = ticket.Category.CategoryName,
            PriorityId = ticket.PriorityId,
            PriorityName = ticket.Priority.PriorityName,
            StatusId = ticket.StatusId,
            StatusName = ticket.Status.StatusName,
            CreatedByUserId = ticket.CreatedByUserId,
            CreatedByUserName = ticket.CreatedByUser.Name,
            AssignedToUserId = ticket.AssignedToUserId,
            AssignedToUserName = ticket.AssignedToUser?.Name,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt,
            ResolvedAt = ticket.ResolvedAt,
            ClosedAt = ticket.ClosedAt,
            DueDate = ticket.DueDate,
            Comments = comments
        };
    }
}
