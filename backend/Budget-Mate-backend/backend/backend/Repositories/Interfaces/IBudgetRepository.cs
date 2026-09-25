using backend.Enums;
using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
    public interface IBudgetRepository
    {
        Task<IEnumerable<Budget>> GetAllBudgetsAsync();
        Task<IEnumerable<Budget>> GetByDepartmentAsync(string department);
        Task<bool> AddBudgetAsync(Budget budget);
        Task<decimal> GetTotalBudgetAllocatedAsync();
        Task<decimal> GetTotalClosedApprovalsAsync();
        Task<Budget?> GetByIdAsync(string budgetId);
        Task<bool> UpdateBudgetAsync(Budget budget);
        // Add this to IBudgetRepository.cs
        Task<bool> ExistsAsync(string budgetId);
        
    }
}
