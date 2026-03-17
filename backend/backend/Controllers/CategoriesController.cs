using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/categories")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryService _service;

        public CategoriesController(CategoryService service)
        {
            _service = service;
        }

        
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _service.GetAll();

            return Ok(categories.Select(c => new
            {
                c.CategoryId,
                c.CategoryName,
                c.Description
            }));
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _service.GetById(id);

            if (category == null)
                return NotFound();

            return Ok(category);
        }

        
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(Category category)
        {
            var created = await _service.Create(category);
            return Ok(created);
        }

        
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, Category updated)
        {
            var category = await _service.Update(id, updated);

            if (category == null)
                return NotFound();

            return Ok(category);
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.Delete(id);

            if (!success)
                return NotFound();

            return Ok(new { message = "Category deleted" });
        }
    }
}
