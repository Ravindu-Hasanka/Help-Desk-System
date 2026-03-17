using backend.Dto;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _auth;

        public AuthController(AuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            await _auth.Register(user);
            return Ok();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var (accessToken, refreshToken) = await _auth.Login(dto.Email, dto.Password);

            return Ok(new
            {
                accessToken,
                refreshToken
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(string refreshToken)
        {
            var token = await _auth.RefreshToken(refreshToken);
            return Ok(new { accessToken = token });
        }
    }
}
