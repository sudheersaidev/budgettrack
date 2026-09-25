using backend.Models.DTOs;
using backend.Services.Implementations;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    // Changed to allow both roles at the class level so Managers aren't blocked globally
    [Authorize(Roles = "Employee,Manager,Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly IExpenseService _expenseService;
        private readonly IBudgetService _budgetService;

        public ExpensesController(IExpenseService expenseService, IBudgetService budgetService)
        {
            _expenseService = expenseService;
            _budgetService = budgetService;
        }

        // 🔹 1. GET: api/Expenses/my-dept-expenses
        // Restricted to Employee as it fetches personal recent history
        [Authorize(Roles = "Employee")]
        [HttpGet("my-dept-expenses")]
        public async Task<IActionResult> GetDeptExpenses()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("UserId");
            var allExpenses = await _expenseService.GetExpensesByDepartmentAsync(User);

            var myRecentExpenses = allExpenses
                .Where(e => e.SubmittedByUserId == userId)
                .OrderByDescending(e => e.SubmittedDate)
                .Take(5);

            return Ok(myRecentExpenses);
        }

        // 🔹 2. GET: api/Expenses/all-dept-expenses
        // Fixed: Allows both roles to view the distribution chart data
        [HttpGet("all-dept-expenses")]
        public async Task<IActionResult> GetAllDeptExpenses()
        {
            var expenses = await _expenseService.GetExpensesByDepartmentAsync(User);
            return Ok(expenses);
        }

        // 🔹 3. POST: api/Expenses/submit
        [Authorize(Roles = "Employee")]
        [HttpPost("submit")]
        public async Task<IActionResult> Submit([FromBody] ExpenseCreateDto dto)
        {
            if (dto == null) return BadRequest("Expense data is required.");

            var result = await _expenseService.CreateExpenseAsync(dto, User);
            return Ok(new { message = "Expense submitted successfully", data = result });
        }

        // 🔹 4. GET: api/Expenses/total-dept-budget
        [HttpGet("total-dept-budget")]
        public async Task<IActionResult> GetTotalDeptBudget()
        {
            var total = await _expenseService.GetTotalDeptBudgetAsync(User);
            return Ok(new { totalDeptBudget = total });
        }

        // 🔹 5. GET: api/Expenses/pending-approvals
        [HttpGet("pending-approvals")]
        public async Task<IActionResult> GetPendingApprovals()
        {
            var amount = await _expenseService.GetPendingApprovalsAmountAsync(User);
            return Ok(new { pendingApprovals = amount });
        }

        // 🔹 6. GET: api/Expenses/my-assigned-budgets
        [Authorize(Roles = "Employee")]
        [HttpGet("my-assigned-budgets")]
        public async Task<IActionResult> GetMyAssignedBudgets()
        {
            var budgets = await _budgetService.GetActiveBudgetListWithManagerAsync(User);
            return Ok(budgets);
        }
    }
}