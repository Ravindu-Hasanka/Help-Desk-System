using System.Security.Claims;
using backend.Dto;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/tickets/attachments/{ticketId}")]
    [Authorize]
    public class TicketAttachmentsController : ControllerBase
    {
        private readonly AttachmentService _service;

        public TicketAttachmentsController(AttachmentService service)
        {
            _service = service;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        
        [HttpPost]
        public async Task<IActionResult> Upload(int ticketId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is required");

            var attachment = await _service.Upload(ticketId, GetUserId(), file);

            if (attachment == null)
                return NotFound("Ticket not found");

            return Ok(new AttachmentResponseDto
            {
                AttachmentId = attachment.AttachmentId,
                TicketId = attachment.TicketId,
                OriginalFileName = attachment.OriginalFileName,
                FileType = attachment.FileType!,
                FileSize = attachment.FileSize,
                UploadedAt = attachment.UploadedAt
            });
        }

        
        [HttpGet]
        public async Task<IActionResult> Get(int ticketId)
        {
            var attachments = await _service.GetByTicket(ticketId);

            return Ok(attachments.Select(a => new AttachmentResponseDto
            {
                AttachmentId = a.AttachmentId,
                TicketId = a.TicketId,
                OriginalFileName = a.OriginalFileName,
                FileType = a.FileType!,
                FileSize = a.FileSize,
                UploadedAt = a.UploadedAt
            }));
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> Download(int id)
        {
            var file = await _service.GetById(id);

            if (file == null)
                return NotFound();

            var bytes = await System.IO.File.ReadAllBytesAsync(file.FilePath);

            return File(bytes, file.FileType ?? "application/octet-stream", file.OriginalFileName);
        }

        
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.Delete(id);

            if (!success)
                return NotFound();

            return Ok();
        }
    }
}
