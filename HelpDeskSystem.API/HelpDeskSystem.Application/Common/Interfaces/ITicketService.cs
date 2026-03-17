using HelpDeskSystem.Application.Common.Models;
using HelpDeskSystem.Application.DTOs.Tickets;

namespace HelpDeskSystem.Application.Common.Interfaces;

public interface ITicketService
{
    Task<PagedResult<TicketSummaryDto>> GetTicketsAsync(TicketQueryParameters query, CurrentUserContext currentUser, CancellationToken cancellationToken);
    Task<TicketDetailDto> GetTicketByIdAsync(int ticketId, CurrentUserContext currentUser, CancellationToken cancellationToken);
    Task<TicketDetailDto> CreateTicketAsync(CreateTicketRequest request, CurrentUserContext currentUser, CancellationToken cancellationToken);
    Task<TicketDetailDto> UpdateTicketAsync(int ticketId, UpdateTicketRequest request, CurrentUserContext currentUser, CancellationToken cancellationToken);
    Task<TicketDetailDto> AssignTicketAsync(int ticketId, AssignTicketRequest request, CurrentUserContext currentUser, CancellationToken cancellationToken);
    Task<TicketDetailDto> UpdateStatusAsync(int ticketId, UpdateTicketStatusRequest request, CurrentUserContext currentUser, CancellationToken cancellationToken);
    Task<IReadOnlyList<TicketCommentDto>> GetCommentsAsync(int ticketId, CurrentUserContext currentUser, CancellationToken cancellationToken);
    Task<TicketCommentDto> AddCommentAsync(int ticketId, AddTicketCommentRequest request, CurrentUserContext currentUser, CancellationToken cancellationToken);
}
