using System.ComponentModel.DataAnnotations;

namespace HelpDeskSystem.Application.DTOs.Tickets;

public sealed class CreateTicketRequest
{
    [Required]
    [StringLength(150, MinimumLength = 4)]
    public string Title { get; init; } = string.Empty;

    [Required]
    [StringLength(4000, MinimumLength = 10)]
    public string Description { get; init; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int CategoryId { get; init; }

    [Range(1, int.MaxValue)]
    public int PriorityId { get; init; }

    public int? AssignedToUserId { get; init; }
    public DateTime? DueDate { get; init; }
}
