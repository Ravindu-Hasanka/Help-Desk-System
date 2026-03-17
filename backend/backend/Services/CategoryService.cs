using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CategoryService
    {
        private readonly TicketDbContext _context;

        public CategoryService(TicketDbContext context)
        {
            _context = context;
        }

        
        public async Task<List<Category>> GetAll()
        {
            return await _context.Categories
                .Where(c => c.IsActive)
                .ToListAsync();
        }

        
        public async Task<Category?> GetById(int id)
        {
            return await _context.Categories.FindAsync(id);
        }

        
        public async Task<Category> Create(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        
        public async Task<Category?> Update(int id, Category updated)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
                return null;

            category.CategoryName = updated.CategoryName;
            category.Description = updated.Description;

            await _context.SaveChangesAsync();
            return category;
        }


        public async Task<bool> Delete(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
                return false;

            category.IsActive = false;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
