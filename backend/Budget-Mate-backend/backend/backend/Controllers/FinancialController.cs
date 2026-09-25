using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class FinancialController : ControllerBase
    {
        private readonly IFinancialService _service;
        public FinancialController(IFinancialService service) => _service = service;

        [HttpGet("header-stats")]
        public async Task<IActionResult> GetGlobalHeaderStats()
        {
            var stats = await _service.GetAdminStatsAsync();
            return Ok(stats);
        }

        [HttpGet("department-utilization")]
        public async Task<IActionResult> GetDepartmentUtilization()
        {
            var stats = await _service.GetDepartmentalStatsAsync();
            return Ok(stats);
        }

        // NEW API: Transfer Budget Ownership
        [HttpPost("transfer-ownership")]
        public async Task<IActionResult> TransferOwnership([FromBody] TransferBudgetDto dto)
        {
            var (success, message) = await _service.TransferBudgetOwnershipAsync(dto);

            if (!success)
            {
                return BadRequest(new { Message = message });
            }

            return Ok(new { Message = message });
        }
    }
}