using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AttachmentService
    {
        private readonly TicketDbContext _context;
        private readonly IWebHostEnvironment _env;

        public AttachmentService(TicketDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        private string GetUploadPath()
        {
            var path = Path.Combine(_env.ContentRootPath, "uploads");

            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);

            return path;
        }

        
        public async Task<TicketAttachment?> Upload(int ticketId, int userId, IFormFile file)
        {
            var ticketExists = await _context.Tickets
                .AnyAsync(t => t.TicketId == ticketId && !t.IsDeleted);

            if (!ticketExists)
                return null;

            var uploadPath = GetUploadPath();

            var storedFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var fullPath = Path.Combine(uploadPath, storedFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var attachment = new TicketAttachment
            {
                TicketId = ticketId,
                UploadedByUserId = userId,

                OriginalFileName = file.FileName,
                StoredFileName = storedFileName,
                FilePath = fullPath,

                FileType = file.ContentType,
                FileSize = file.Length,
                UploadedAt = DateTime.UtcNow
            };

            _context.TicketAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            return attachment;
        }

        
        public async Task<List<TicketAttachment>> GetByTicket(int ticketId)
        {
            return await _context.TicketAttachments
                .Where(a => a.TicketId == ticketId)
                .OrderByDescending(a => a.UploadedAt)
                .ToListAsync();
        }

        
        public async Task<TicketAttachment?> GetById(int id)
        {
            return await _context.TicketAttachments.FindAsync(id);
        }

        
        public async Task<bool> Delete(int id)
        {
            var attachment = await _context.TicketAttachments.FindAsync(id);

            if (attachment == null)
                return false;

            if (File.Exists(attachment.FilePath))
                File.Delete(attachment.FilePath);

            _context.TicketAttachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
