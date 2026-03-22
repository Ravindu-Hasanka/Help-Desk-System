using System.Security.Authentication;
using System.Security.Claims;
using backend.Dto;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService auth)
        {
            _authService = auth;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            try
            {
                await _authService.Register(user);
                return Ok();
            }
            catch (Exception ex) when (IsDatabaseUnavailable(ex))
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    message = "Database connection is unavailable. Update the backend connection string to a reachable PostgreSQL server and try again."
                });
            }
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
            catch (Exception ex) when (IsDatabaseUnavailable(ex))
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    message = "Database connection is unavailable. Update the backend connection string to a reachable PostgreSQL server and try again."
                });
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
            catch (Exception ex) when (IsDatabaseUnavailable(ex))
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    message = "Database connection is unavailable. Update the backend connection string to a reachable PostgreSQL server and try again."
                });
            }
        }


        [HttpGet("me")]
        [Authorize]
        public IActionResult Me()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value ?? email;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var isActiveClaim = User.FindFirst("isActive")?.Value;
            var isActive = !string.IsNullOrWhiteSpace(isActiveClaim)
                ? bool.Parse(isActiveClaim)
                : true;

            if (userId == null || email == null || name == null || role == null)
                return Unauthorized(new { message = "Invalid token payload" });

            return Ok(new
            {
                Id = int.Parse(userId),
                Email = email,
                Name = name,
                Role = role,
                IsActive = isActive
            });
        }

        private static bool IsDatabaseUnavailable(Exception exception)
        {
            if (exception is NpgsqlException || exception is TimeoutException)
                return true;

            if (exception.InnerException != null)
                return IsDatabaseUnavailable(exception.InnerException);

            return false;
        }
    }
}
