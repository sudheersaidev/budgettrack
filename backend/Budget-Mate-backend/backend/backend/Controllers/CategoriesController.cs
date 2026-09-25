using backend.Models;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _service;

    public CategoriesController(ICategoryService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _service.GetAllCategoriesAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var category = await _service.GetCategoryByIdAsync(id);
        return category == null ? NotFound() : Ok(category);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Category category)
    {
        var result = await _service.AddCategoryAsync(category);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, [FromBody] Category category)
    {
        await _service.UpdateCategoryAsync(id, category);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteCategoryAsync(id);
        return NoContent();
    }
}