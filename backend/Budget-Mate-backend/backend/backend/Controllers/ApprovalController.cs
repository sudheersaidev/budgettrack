using backend.Enums;
using backend.Models.DTOs;
using backend.Services.Implementations;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApprovalController : ControllerBase
    {
        private readonly IApprovalService _approvalService;

        public ApprovalController(IApprovalService approvalService)
        {
            _approvalService = approvalService;
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetStats()
        {
            var deptString = User.FindFirst("Department")?.Value;

            // 🔹 Add this line to get the manager name
            var managerName = User.Identity?.Name ?? User.FindFirst(ClaimTypes.Name)?.Value;

            if (Enum.TryParse<Department>(deptString, out var dept))
            {
                // 🔹 Pass managerName here to fix the CS7036 error
                var stats = await _approvalService.GetStatsAsync(dept, managerName);
                return Ok(stats);
            }
            return BadRequest("Invalid Department");
        }

        // GET: api/Approval/my-dept-expenses
        [HttpGet("my-dept-expenses")]
        public async Task<IActionResult> GetMyDeptExpenses()
        {
            var deptString = User.FindFirst("Department")?.Value ?? "IT";

            // 🔹 Get the logged-in manager's name from the Token
            var managerName = User.Identity?.Name ?? User.FindFirst(ClaimTypes.Name)?.Value;

            if (!Enum.TryParse<Department>(deptString, out var dept))
            {
                return BadRequest("Invalid department.");
            }

            // Pass managerName to the service
            var expenses = await _approvalService.GetDeptExpensesAsync(dept, managerName);
            return Ok(expenses);
        }

        // PUT: api/Approval/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateExpenseStatusDto statusDto)
        {
            if (statusDto.Status != "Approved" && statusDto.Status != "Rejected")
            {
                return BadRequest("Invalid status value. Must be 'Approved' or 'Rejected'.");
            }

            var result = await _approvalService.UpdateStatusAsync(id, statusDto);

            if (!result)
            {
                return NotFound(new { message = "Expense not found or update failed" });
            }

            return Ok(new { message = "Status updated successfully" });
        }
    }
}