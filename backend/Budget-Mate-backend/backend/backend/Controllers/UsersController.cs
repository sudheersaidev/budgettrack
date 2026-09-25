using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    // GET: api/Users
    //gets all user
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        var users = await _userRepository.GetAllUsersAsync();
        return Ok(users);
    }

    // PUT: api/Users/toggle-status/U101
    [HttpPut("toggle-status/{id}")]
    public async Task<IActionResult> ToggleStatus(string id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        // Toggle logic
        user.Status = (user.Status == "Active") ? "Inactive" : "Active";

        var result = await _userRepository.UpdateUserAsync(user);
        if (!result) return BadRequest("Could not update user status");

        return Ok(new { status = user.Status });
    }
    [HttpPut("update-profile/{id}")]
    public async Task<IActionResult> UpdateProfile(string id, [FromBody] ProfileUpdateDto profileDto)
    {
        // Accesses the repository to hash the password and update the user record
        var result = await _userRepository.UpdateUserProfileAsync(id, profileDto.Name, profileDto.Password);

        if (!result) return BadRequest("Could not update profile details.");

        return Ok(new { message = "Profile updated successfully" });
    }
    // GET: api/Users/profile/U101
    [HttpGet("profile/{id}")]
    public async Task<IActionResult> GetUserProfile(string id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        // Return only the necessary info, including Status
        return Ok(new
        {
            userID = user.UserID,
            name = user.Name,
            email = user.Email,
            role = user.Role.ToString(),
            department = user.Department.ToString(),
            status = user.Status
        });
    }
    // GET: api/Users/department/IT
    [HttpGet("department/{deptName}")]
    public async Task<ActionResult<IEnumerable<User>>> GetUsersByDepartment(string deptName)
    {
        var allUsers = await _userRepository.GetAllUsersAsync();

        // Filter users by department string and return them
        var deptUsers = allUsers.Where(u =>
            u.Department.ToString().Equals(deptName, StringComparison.OrdinalIgnoreCase)
        );

        return Ok(deptUsers);
    }
    [HttpGet("role/{roleName}")]
    public async Task<IActionResult> GetUsersByRole(string roleName)
    {
        var allUsers = await _userRepository.GetAllUsersAsync();
        var roleUsers = allUsers.Where(u =>
            u.Role.ToString().Equals(roleName, StringComparison.OrdinalIgnoreCase)
        ).Select(u => new {
            u.UserID,
            u.Name,
            u.Status // Frontend needs this to show ID if Inactive
        });

        return Ok(roleUsers);
    }
    [HttpGet("all-managers")]
    [Authorize(Roles = "Admin,Manager")] // Ensure your JWT has these roles
    public async Task<IActionResult> GetAllManagers()
    {
        var allUsers = await _userRepository.GetAllUsersAsync();
        var managers = allUsers
            .Where(u => u.Role.ToString().Equals("Manager", StringComparison.OrdinalIgnoreCase))
            .Select(u => new {
                u.UserID,
                u.Name,
                u.Status,
                u.Department
            });
        return Ok(managers);
    }
    // Add this to your existing UsersController.cs
    [HttpGet("recent-logins")]
    public async Task<IActionResult> GetRecentLogins()
    {
        // This joins the LoginLogs with the Users table to get the name and role
        var logs = await _userRepository.GetRecentLoginLogsAsync(); // Ensure your repo has this

        // If your repo doesn't have that yet, you can query the context directly if injected:
        // var logs = await _context.LoginLogs.Include(l => l.User).OrderByDescending(l => l.LoginTime).Take(20).ToListAsync();

        return Ok(logs);
    }

}