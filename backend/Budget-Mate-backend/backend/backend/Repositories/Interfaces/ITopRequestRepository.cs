using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
    public interface ITopRequestRepository
    {
        Task<IEnumerable<TopUpRequest>> GetAllAsync();
        Task AddAsync(TopUpRequest request);
        Task<TopUpRequest?> GetByIdAsync(string requestId);
        Task<string> GetLastIdAsync();

        // 🔹 ADD THESE TWO MISSING METHODS
        Task UpdateAsync(TopUpRequest request);
        Task<bool> UpdateBudgetAmountAsync(string budgetId, decimal amount);

        // This is optional if you use UpdateAsync, but kept for compatibility
        Task UpdateStatusAsync(string requestId, string status);
    }
}