using backend.Dto;
using backend.Enum;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ReportService
    {
        private readonly TicketDbContext _context;

        public ReportService(TicketDbContext context)
        {
            _context = context;
        }

        public async Task<List<TicketReportDto>> GetTickets(
            Status? status,
            int? categoryId,
            DateTime? from,
            DateTime? to)
        {
            var query = _context.Tickets
                .Where(t => !t.IsDeleted)
                .AsQueryable();

            if (status.HasValue)
                query = query.Where(t => t.Status == status);

            if (categoryId.HasValue)
                query = query.Where(t => t.CategoryId == categoryId);

            if (from.HasValue)
                query = query.Where(t => t.CreatedAt >= from);

            if (to.HasValue)
                query = query.Where(t => t.CreatedAt <= to);

            return await query
                .Select(t => new TicketReportDto
                {
                    TicketNumber = t.TicketNumber,
                    Title = t.Title,
                    Status = t.Status.ToString(),
                    Priority = t.Priority.ToString(),
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();
        }
    }
}
