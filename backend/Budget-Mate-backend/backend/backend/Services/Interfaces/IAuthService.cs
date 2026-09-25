using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<(bool Success, string Message)> RegisterUserAsync(RegisterDto registerDto);
        Task<(string? Token, object? UserInfo, string Message)> LoginAsync(LoginDto loginDto);
    }
}
