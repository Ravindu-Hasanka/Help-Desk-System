using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly DashboardService _service;

        public DashboardController(DashboardService service)
        {
            _service = service;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
            => Ok(await _service.GetSummary());

        [HttpGet("tickets-by-category")]
        public async Task<IActionResult> ByCategory()
            => Ok(await _service.TicketsByCategory());

        [HttpGet("tickets-by-priority")]
        public async Task<IActionResult> ByPriority()
            => Ok(await _service.TicketsByPriority());

        [HttpGet("tickets-by-status")]
        public async Task<IActionResult> ByStatus()
            => Ok(await _service.TicketsByStatus());

        [HttpGet("agent-performance")]
        public async Task<IActionResult> AgentPerformance()
            => Ok(await _service.AgentPerformance());
    }
}
