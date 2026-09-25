using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,Employee,Manager")]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetService _budgetService;

    public BudgetsController(IBudgetService budgetService)
    {
        _budgetService = budgetService;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateBudget([FromBody] BudgetCreateDto dto)
    {
        var (success, message, data) = await _budgetService.CreateBudgetAsync(dto, User);
        if (!success) return message.Contains("department") ? StatusCode(403, new { message }) : BadRequest(new { message });

        return Ok(new { message, data });
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var budgets = await _budgetService.GetBudgetsForUserAsync(User);
        return Ok(budgets);
    }

    [HttpPut("close/{id}")]
    public async Task<IActionResult> CloseBudget(string id)
    {
        var (success, message) = await _budgetService.CloseBudgetAsync(id);
        return success ? Ok(new { message = "Budget status updated to Closed." }) : BadRequest(new { message });
    }
    [HttpPut("activate/{id}")]
    public async Task<IActionResult> ActivateBudget(string id)
    {
        var result = await _budgetService.UpdateStatusAsync(id, "Active");
        return result ? Ok() : NotFound();
    }
    // Path: backend.Controllers/BudgetsController.cs

    [HttpGet("my-assigned-budgets")]
    public async Task<IActionResult> GetMyAssignedBudgets()
    {
        // Ensure this matches the method name in your Service/Interface
        var budgets = await _budgetService.GetActiveBudgetListWithManagerAsync(User);
        return Ok(budgets);
    }
}