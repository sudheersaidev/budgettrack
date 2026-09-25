// Path: backend.Services.Implementations/AuthService.cs
using backend.Data; // Ensure you import your Data namespace
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IConfiguration _config;
        private readonly BudgetDbContext _context; // Inject Context to save logs

        public AuthService(IUserRepository userRepo, IConfiguration config, BudgetDbContext context)
        {
            _userRepo = userRepo;
            _config = config;
            _context = context;
        }

        public async Task<(bool Success, string Message)> RegisterUserAsync(RegisterDto registerDto)
        {
            //checking if email is already registered
            if (await _userRepo.GetByEmailAsync(registerDto.Email) != null)
                return (false, "Email is already registered.");
            //checking if user id is already taken
            if (await _userRepo.GetByIdAsync(registerDto.UserID) != null)
                return (false, $"The User ID '{registerDto.UserID}' is already taken.");


            var user = new User
            {
                UserID = registerDto.UserID,
                Name = registerDto.Name,
                Email = registerDto.Email,
                PasswordHash = string.Empty,
                Role = registerDto.Role,
                Department = registerDto.Department,
                Status = "Active"
            };

            var result = await _userRepo.AddUserAsync(user, registerDto.Password);
            return result ? (true, "User registered successfully!") : (false, "Registration failed.");
        }

        public async Task<(string? Token, object? UserInfo, string Message)> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepo.GetByEmailAsync(loginDto.Email);


            //comparing the database password with login ui password
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return (null, null, "Invalid email or password.");

            // 1. Generate Token
            var token = GenerateJwtToken(user);

            // 2. Prepare User Info
            var userInfo = new
            {
                user.UserID,
                user.Name,
                user.Email,
                user.Role,
                user.Department,
                user.Status // Helpful for the frontend log
            };

            // 3. Create and Save Login Log
            var log = new LoginLog
            {
                UserID = user.UserID,
                LoginTime = DateTime.Now
            };

            _context.LoginLogs.Add(log);
            await _context.SaveChangesAsync();

            // 4. Return everything at the end
            return (token, userInfo, "Login successful.");
            
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key missing.");
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserID),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("Department", user.Department.ToString())
            };

            //signing token
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            //used to generate jwt signature
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256); 

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds // Fixed variable name
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}