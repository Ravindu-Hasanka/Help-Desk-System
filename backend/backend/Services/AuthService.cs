using backend.Models;
using BCrypt.Net;

namespace backend.Services
{
    public class AuthService
    {
        private readonly TicketDbContext _context;
        private readonly JwtService _jwt;

        public AuthService(TicketDbContext context, JwtService jwt)
        {
            _context = context;
            _jwt = jwt;
        }

        public async Task Register(User user)
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task<(string accessToken, string refreshToken)> Login(string email, string password)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
                throw new Exception("Invalid credentials");

            var accessToken = _jwt.GenerateAccessToken(user);
            var refreshToken = _jwt.GenerateRefreshToken(user);

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            await _context.SaveChangesAsync();

            return (accessToken, refreshToken);
        }

        public async Task<string> RefreshToken(string refreshToken)
        {
            var user = _context.Users.FirstOrDefault(u => u.RefreshToken == refreshToken);

            if (user == null || user.RefreshTokenExpiryTime < DateTime.UtcNow)
                throw new Exception("Invalid refresh token");

            var newAccessToken = _jwt.GenerateAccessToken(user);
            return newAccessToken;
        }
    }
}
