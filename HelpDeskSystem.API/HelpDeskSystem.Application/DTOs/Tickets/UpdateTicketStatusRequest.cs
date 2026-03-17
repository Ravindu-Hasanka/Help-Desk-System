using System.ComponentModel.DataAnnotations;

namespace HelpDeskSystem.Application.DTOs.Tickets;

public sealed class UpdateTicketStatusRequest
{
    [Range(1, int.MaxValue)]
    public int StatusId { get; init; }
}
