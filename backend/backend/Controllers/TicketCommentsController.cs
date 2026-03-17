using System.Security.Claims;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Dto;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/tickets/{ticketId}/comments")]
    [Authorize]
    public class TicketCommentsController : ControllerBase
    {
        private readonly CommentService _service;

        public TicketCommentsController(CommentService service)
        {
            _service = service;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        
        [HttpGet]
        public async Task<IActionResult> Get(int ticketId)
        {
            var comments = await _service.GetByTicket(ticketId);

            var result = comments.Select(c => new CommentResponseDto
            {
                CommentId = c.CommentId,
                TicketId = c.TicketId,
                UserId = c.UserId,
                CommentText = c.CommentText,
                IsInternalNote = c.IsInternalNote,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            });

            return Ok(result);
        }

        
        [HttpPost]
        public async Task<IActionResult> Create(int ticketId, CreateCommentDto dto)
        {
            var comment = await _service.Create(
                ticketId,
                GetUserId(),
                dto.CommentText,
                dto.IsInternalNote
            );

            if (comment == null)
                return NotFound("Ticket not found");

            return Ok(comment);
        }

        [HttpPut("{commentId}")]
        public async Task<IActionResult> Update(int commentId, UpdateCommentDto dto)
        {
            var comment = await _service.Update(
                commentId,
                GetUserId(),
                dto.CommentText
            );

            if (comment == null)
                return NotFound();

            return Ok(comment);
        }

        
        [HttpDelete("{commentId}")]
        public async Task<IActionResult> Delete(int commentId)
        {
            var success = await _service.Delete(
                commentId,
                GetUserId()
            );

            if (!success)
                return NotFound();

            return Ok();
        }
    }
}
