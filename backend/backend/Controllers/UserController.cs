using backend.Dto;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers(string? role, bool? isActive)
        {
            var users = await _userService.GetAll(role, isActive);
            return Ok(users.Select(ToUserResponse));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _userService.GetById(id);

            if (user == null)
                return NotFound();

            return Ok(ToUserResponse(user));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateUserDto user)
        {
            var created = await _userService.Create(user);
            return Ok(ToUserResponse(created));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateUserDto updated)
        {
            var user = await _userService.Update(id, updated);

            if (user == null)
                return NotFound();

            return Ok(ToUserResponse(user));
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateStatusDto dto)
        {
            var success = await _userService.UpdateStatus(id, dto.IsActive);

            if (!success)
                return NotFound();

            return Ok(new { message = "Status updated" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _userService.Delete(id);

            if (!success)
                return NotFound();

            return Ok(new { message = "User deleted" });
        }

        private static UserResponseDto ToUserResponse(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                PhoneNo = user.PhoneNo,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }
    }
}
