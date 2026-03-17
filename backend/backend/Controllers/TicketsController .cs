using System.Security.Claims;
using backend.Dto;
using backend.Enum;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/tickets")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly TicketService _service;

        public TicketsController(TicketService service)
        {
            _service = service;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        private string GetRole() =>
            User.FindFirst(ClaimTypes.Role)!.Value;

        
        [HttpGet]
        public async Task<IActionResult> GetAll(
            Status? status,
            Priority? priority,
            int? categoryId,
            int? assignedTo,
            int? createdBy,
            string? search,
            DateTime? from,
            DateTime? to,
            int page = 1,
            int pageSize = 10)
        {
            var tickets = await _service.GetAll(
                status, priority, categoryId,
                assignedTo, createdBy,
                search, from, to,
                page, pageSize,
                GetUserId(), GetRole()
            );

            return Ok(tickets);
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var ticket = await _service.GetById(id);

            if (ticket == null)
                return NotFound();

            return Ok(ticket);
        }

        
        [HttpPost]
        public async Task<IActionResult> Create(CreateTicketDto dto)
        {
            var ticket = new Ticket
            {
                Title = dto.Title,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                Priority = dto.Priority
            };

            var created = await _service.Create(ticket, GetUserId());

            return Ok(created);
        }

        
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateTicketDto dto)
        {
            var updatedTicket = new Ticket
            {
                Title = dto.Title,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                Priority = dto.Priority
            };

            var result = await _service.Update(id, updatedTicket);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, Status status)
        {
            var success = await _service.UpdateStatus(id, status);

            if (!success)
                return NotFound();

            return Ok();
        }

        
        [HttpPatch("{id}/priority")]
        public async Task<IActionResult> UpdatePriority(int id, Priority priority)
        {
            var success = await _service.UpdatePriority(id, priority);

            if (!success)
                return NotFound();

            return Ok();
        }

        
        [HttpPatch("{id}/assign")]
        public async Task<IActionResult> Assign(int id, int assignedToUserId)
        {
            var success = await _service.Assign(id, assignedToUserId);

            if (!success)
                return NotFound();

            return Ok();
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
