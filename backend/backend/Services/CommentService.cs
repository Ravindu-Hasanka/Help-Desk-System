using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CommentService
    {
        private readonly TicketDbContext _context;

        public CommentService(TicketDbContext context)
        {
            _context = context;
        }

        
        public async Task<List<TicketComment>> GetByTicket(int ticketId)
        {
            return await _context.TicketComments
                .Where(c => c.TicketId == ticketId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        
        public async Task<TicketComment?> Create(int ticketId, int userId, string text, bool isInternal)
        {
            var ticketExists = await _context.Tickets.AnyAsync(t => t.TicketId == ticketId && !t.IsDeleted);
            if (!ticketExists)
                return null;

            var comment = new TicketComment
            {
                TicketId = ticketId,
                UserId = userId,
                CommentText = text,
                IsInternalNote = isInternal,
                CreatedAt = DateTime.UtcNow
            };

            _context.TicketComments.Add(comment);
            await _context.SaveChangesAsync();

            return comment;
        }

        
        public async Task<TicketComment?> Update(int commentId, int userId, string text)
        {
            var comment = await _context.TicketComments.FindAsync(commentId);

            if (comment == null)
                return null;

            
            if (comment.UserId != userId)
                return null;

            comment.CommentText = text;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return comment;
        }

        
        public async Task<bool> Delete(int commentId, int userId)
        {
            var comment = await _context.TicketComments.FindAsync(commentId);

            if (comment == null)
                return false;

            if (comment.UserId != userId)
                return false;

            _context.TicketComments.Remove(comment);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
