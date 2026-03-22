using System.Security.Authentication;
using System.Security.Claims;
using backend.Dto;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly UserService _userService;

        public AuthController(AuthService auth, UserService userService)
        {
            _authService = auth;
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            await _authService.Register(user);
            return Ok();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                var (accessToken, refreshToken) = await _authService.Login(dto.Email, dto.Password);

                return Ok(new
                {
                    accessToken,
                    refreshToken
                });
            }
            catch (AuthenticationException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(string refreshToken)
        {
            try
            {
                var token = await _authService.RefreshToken(refreshToken);
                return Ok(new { accessToken = token });
            }
            catch (AuthenticationException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }


        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
                return Unauthorized();

            var user = await _userService.GetById(int.Parse(userId));

            if (user == null)
                return NotFound();

            return Ok(new
            {
                user.Id,
                user.Email,
                user.Name,
                user.Role,
                user.IsActive
            });
        }
    }
}
