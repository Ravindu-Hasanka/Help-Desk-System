using backend.Enum;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class TicketService
    {
        private readonly TicketDbContext _context;

        public TicketService(TicketDbContext context)
        {
            _context = context;
        }


        public async Task<List<Ticket>> GetAll(
            Status? status,
            Priority? priority,
            int? categoryId,
            int? assignedTo,
            int? createdBy,
            string? search,
            DateTime? from,
            DateTime? to,
            int page,
            int pageSize,
            int currentUserId,
            string role
        )
        {
            var query = _context.Tickets
                .Where(t => !t.IsDeleted)
                .AsQueryable();

            
            if (role == "User")
                query = query.Where(t => t.CreatedByUserId == currentUserId);

            if (role == "Agent" || role == "SupportAgent")
                query = query.Where(t => t.AssignedToUserId == currentUserId);


            if (status.HasValue)
                query = query.Where(t => t.Status == status);

            if (priority.HasValue)
                query = query.Where(t => t.Priority == priority);

            if (categoryId.HasValue)
                query = query.Where(t => t.CategoryId == categoryId);

            if (assignedTo.HasValue)
                query = query.Where(t => t.AssignedToUserId == assignedTo);

            if (createdBy.HasValue)
                query = query.Where(t => t.CreatedByUserId == createdBy);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(t => t.Title.Contains(search) || t.Description.Contains(search));

            if (from.HasValue)
                query = query.Where(t => t.CreatedAt >= from);

            if (to.HasValue)
                query = query.Where(t => t.CreatedAt <= to);

            return await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        
        public async Task<Ticket?> GetById(int id)
        {
            return await _context.Tickets
                .FirstOrDefaultAsync(t => t.TicketId == id && !t.IsDeleted);
        }

        
        public async Task<Ticket> Create(Ticket ticket, int userId)
        {
            ticket.CreatedByUserId = userId;
            ticket.AssignedToUserId = userId;
            ticket.Status = Status.Open;
            ticket.CreatedAt = DateTime.UtcNow;
            ticket.TicketNumber = $"TKT-{DateTime.UtcNow.Ticks}";

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return ticket;
        }

        
        public async Task<Ticket?> Update(int id, Ticket updated)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null || ticket.IsDeleted)
                return null;

            ticket.Title = updated.Title;
            ticket.Description = updated.Description;
            ticket.CategoryId = updated.CategoryId;
            ticket.Priority = updated.Priority;

            await _context.SaveChangesAsync();
            return ticket;
        }

        
        public async Task<bool> UpdateStatus(int id, Status status)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
                return false;

            ticket.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        
        public async Task<bool> UpdatePriority(int id, Priority priority)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
                return false;

            ticket.Priority = priority;
            await _context.SaveChangesAsync();
            return true;
        }

        
        public async Task<bool> Assign(int id, int userId)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
                return false;

            ticket.AssignedToUserId = userId;
            await _context.SaveChangesAsync();
            return true;
        }

        
        public async Task<bool> Delete(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
                return false;

            ticket.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
