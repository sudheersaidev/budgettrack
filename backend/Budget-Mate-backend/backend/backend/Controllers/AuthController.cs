// Path: backend.Controllers/AuthController.cs
using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
         
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var (success, message) = await _authService.RegisterUserAsync(registerDto);
            return success ? Ok(new { message }) : BadRequest(message);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var (token, userInfo, message) = await _authService.LoginAsync(loginDto);

            if (token == null)
                return Unauthorized(message);

            return Ok(new { token, user = userInfo });
        }

    }
}