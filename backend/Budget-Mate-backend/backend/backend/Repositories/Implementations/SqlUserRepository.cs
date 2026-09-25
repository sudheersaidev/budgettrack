namespace backend.Repositories.Implementations
{
    using backend.Data;
    using backend.Models.Entities;
    using backend.Repositories.Interfaces;
    using Microsoft.EntityFrameworkCore;
    using BC = BCrypt.Net.BCrypt;

    public class SqlUserRepository : IUserRepository
    {
        private readonly BudgetDbContext _context;
        public SqlUserRepository(BudgetDbContext context) => _context = context;

        // FIX: Removed 'await' because it's an expression-bodied member returning the Task directly
        public async Task<User?> GetByEmailAsync(string email) =>
            await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Implementation to find user by Primary Key (UserID)
        // In SqlUserRepository.cs
        public async Task<User?> GetByIdAsync(string userId) =>
            await _context.Users.FirstOrDefaultAsync(u => u.UserID.Trim() == userId.Trim());

        public async Task<bool> AddUserAsync(User user, string password)
        {
            try
            {
                user.PasswordHash = BC.HashPassword(password);
                await _context.Users.AddAsync(user);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (DbUpdateException ex)
            {
                // Log the error
                return false;
            }
        }
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            return await _context.SaveChangesAsync() > 0;
        }


        // Inside SqlUserRepository.cs
        public async Task<bool> UpdateUserProfileAsync(string userId, string name, string? password)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Name = name;

            if (!string.IsNullOrEmpty(password))
            {
                // Use BCrypt or your preferred hashing library
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            }

            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<IEnumerable<object>> GetRecentLoginLogsAsync()
        {
            return await _context.LoginLogs
                .Include(l => l.User) // Join with Users table
                .OrderByDescending(l => l.LoginTime) // Latest logins first
                .Take(20) // Limit to top 20 for performance
                .Select(l => new
                {
                    id = l.LogID,
                    userID = l.UserID,
                    name = l.User.Name,
                    role = l.User.Role.ToString(),
                    department = l.User.Department.ToString(),
                    status = l.User.Status,
                    email = l.User.Email,
                    loginTime = l.LoginTime
                })
                .ToListAsync();
        }
    }
}