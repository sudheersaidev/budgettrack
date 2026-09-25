using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        // Added this to check for duplicate Primary Keys
        Task<User?> GetByIdAsync(string userId);
        Task<bool> AddUserAsync(User user, string password);

        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<bool> UpdateUserAsync(User user);
        Task<bool> UpdateUserProfileAsync(string userId, string newName, string? newPassword);
        Task<IEnumerable<object>> GetRecentLoginLogsAsync();
    }
}
