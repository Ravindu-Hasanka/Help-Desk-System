using backend.Dto;
using backend.Enum;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class DashboardService
    {
        private readonly TicketDbContext _context;

        public DashboardService(TicketDbContext context)
        {
            _context = context;
        }

        
        public async Task<DashboardSummaryDto> GetSummary()
        {
            var tickets = _context.Tickets.Where(t => !t.IsDeleted);

            return new DashboardSummaryDto
            {
                TotalTickets = await tickets.CountAsync(),
                OpenTickets = await tickets.CountAsync(t => t.Status == Status.Open),
                InProgressTickets = await tickets.CountAsync(t => t.Status == Status.InProgress),
                ResolvedTickets = await tickets.CountAsync(t => t.Status == Status.Resolved),
                ClosedTickets = await tickets.CountAsync(t => t.Status == Status.Closed)
            };
        }

        
        public async Task<List<ChartItemDto>> TicketsByCategory()
        {
            return await _context.Tickets
                .Where(t => !t.IsDeleted)
                .GroupBy(t => t.Category!.CategoryName)
                .Select(g => new ChartItemDto
                {
                    Label = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();
        }

        
        public async Task<List<ChartItemDto>> TicketsByPriority()
        {
            return await _context.Tickets
                .Where(t => !t.IsDeleted)
                .GroupBy(t => t.Priority)
                .Select(g => new ChartItemDto
                {
                    Label = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();
        }

        
        public async Task<List<ChartItemDto>> TicketsByStatus()
        {
            return await _context.Tickets
                .Where(t => !t.IsDeleted)
                .GroupBy(t => t.Status)
                .Select(g => new ChartItemDto
                {
                    Label = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();
        }


        public async Task<List<AgentPerformanceDto>> AgentPerformance()
        {
            return await _context.Tickets
                .Where(t => t.AssignedToUserId != null && !t.IsDeleted)
                .GroupBy(t => new { t.AssignedToUserId, t.AssignedToUser!.Name })
                .Select(g => new AgentPerformanceDto
                {
                    UserId = g.Key.AssignedToUserId!.Value,
                    Name = g.Key.Name,
                    TicketCount = g.Count()
                })
                .OrderByDescending(x => x.TicketCount)
                .ToListAsync();
        }
    }
}
