using HelpDeskSystem.API.Extensions;
using HelpDeskSystem.Application.Common.Interfaces;
using HelpDeskSystem.Application.DTOs.Tickets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class TicketsController(ITicketService ticketService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTickets([FromQuery] TicketQueryParameters query, CancellationToken cancellationToken)
    {
        var response = await ticketService.GetTicketsAsync(query, User.ToCurrentUserContext(), cancellationToken);
        return Ok(response);
    }

    [HttpGet("{ticketId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTicket(int ticketId, CancellationToken cancellationToken)
    {
        var response = await ticketService.GetTicketByIdAsync(ticketId, User.ToCurrentUserContext(), cancellationToken);
        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request, CancellationToken cancellationToken)
    {
        var response = await ticketService.CreateTicketAsync(request, User.ToCurrentUserContext(), cancellationToken);
        return CreatedAtAction(nameof(GetTicket), new { ticketId = response.TicketId }, response);
    }

    [HttpPut("{ticketId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateTicket(int ticketId, [FromBody] UpdateTicketRequest request, CancellationToken cancellationToken)
    {
        var response = await ticketService.UpdateTicketAsync(ticketId, request, User.ToCurrentUserContext(), cancellationToken);
        return Ok(response);
    }

    [HttpPost("{ticketId:int}/assign")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AssignTicket(int ticketId, [FromBody] AssignTicketRequest request, CancellationToken cancellationToken)
    {
        var response = await ticketService.AssignTicketAsync(ticketId, request, User.ToCurrentUserContext(), cancellationToken);
        return Ok(response);
    }

    [HttpPost("{ticketId:int}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateStatus(int ticketId, [FromBody] UpdateTicketStatusRequest request, CancellationToken cancellationToken)
    {
        var response = await ticketService.UpdateStatusAsync(ticketId, request, User.ToCurrentUserContext(), cancellationToken);
        return Ok(response);
    }

    [HttpGet("{ticketId:int}/comments")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetComments(int ticketId, CancellationToken cancellationToken)
    {
        var response = await ticketService.GetCommentsAsync(ticketId, User.ToCurrentUserContext(), cancellationToken);
        return Ok(response);
    }

    [HttpPost("{ticketId:int}/comments")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AddComment(int ticketId, [FromBody] AddTicketCommentRequest request, CancellationToken cancellationToken)
    {
        var response = await ticketService.AddCommentAsync(ticketId, request, User.ToCurrentUserContext(), cancellationToken);
        return StatusCode(StatusCodes.Status201Created, response);
    }
}
