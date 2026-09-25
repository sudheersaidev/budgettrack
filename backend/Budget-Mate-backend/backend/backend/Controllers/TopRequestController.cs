
using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize(Roles = "Employee,Manager")]
    [ApiController]
    [Route("api/[controller]")]
    public class TopRequestController : ControllerBase
    {
        private readonly ITopRequestService _service;
        public TopRequestController(ITopRequestService service) => _service = service;

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitRequest([FromBody] TopUpRequestDto dto)
        {
            var result = await _service.CreateRequestAsync(dto, User);
            return Ok(result);
        }
        [HttpGet("all")]
        public async Task<IActionResult> GetAllRequests()
        {
            // You need to implement this in your ITopRequestService
            var requests = await _service.GetAllRequestsAsync();
            return Ok(requests);
        }
        // TopRequestController.cs
        [HttpPut("update-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateStatusDto dto)
        {
            // Fix: Pass the entire 'dto' object instead of two separate strings
            var success = await _service.UpdateStatusAsync(dto);
            return success ? Ok() : NotFound();
        }

        [HttpPut("update-balance")]
        public async Task<IActionResult> UpdateBalance([FromBody] UpdateBalanceDto dto)
        {
            var success = await _service.ApplyTopUpToBudgetAsync(dto.BudgetId, dto.Amount);
            return success ? Ok() : BadRequest();
        }
        [HttpGet("my-approvals")]
        public async Task<IActionResult> GetManagerRequests()
        {
            // Fix: Call the service instead of trying to access _context directly
            var requests = await _service.GetRequestsByManagerAsync(User);
            return Ok(requests);
        }
    }
}