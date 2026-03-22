using backend.Dto;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class UserService
    {
        private readonly TicketDbContext _context;

        public UserService(TicketDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetById(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<List<User>> GetAll(string? role, bool? isActive)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role.ToString() == role);

            if (isActive.HasValue)
                query = query.Where(u => u.IsActive == isActive);

            return await query.ToListAsync();
        }

        public async Task<User> Create(CreateUserDto userDto)
        {
            var user = new User
            {
                Name = userDto.Name,
                Email = userDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
                PhoneNo = userDto.PhoneNo,
                Role = userDto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<User?> Update(int id, UpdateUserDto updated)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return null;

            user.Name = updated.Name;
            user.Email = updated.Email;
            user.PhoneNo = updated.PhoneNo;
            user.Role = updated.Role;
            user.IsActive = updated.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<bool> UpdateStatus(int id, bool isActive)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return false;

            user.IsActive = isActive;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return false;

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
