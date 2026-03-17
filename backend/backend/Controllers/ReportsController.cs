using System.Text;
using backend.Enum;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly ReportService _service;

        public ReportsController(ReportService service)
        {
            _service = service;
        }

        
        [HttpGet("tickets")]
        public async Task<IActionResult> GetTickets(
            Status? status,
            int? categoryId,
            DateTime? from,
            DateTime? to)
        {
            var data = await _service.GetTickets(status, categoryId, from, to);
            return Ok(data);
        }
    }
}
