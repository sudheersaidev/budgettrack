using backend.Models.DTOs;
using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
    public interface IFinancialRepository
    {
        Task<decimal> GetTotalApprovedExpensesAsync();
        Task<int> GetCountByStatusAsync(string status);
        Task<decimal> GetTotalAllocatedBudgetAsync();
        Task<IEnumerable<DepartmentUtilizationDto>> GetDepartmentalUtilizationAsync();
        Task<Budget?> GetBudgetByIdAsync(string budgetId);
        Task<bool> HasPendingExpensesAsync(string budgetId);
        Task<bool> UpdateBudgetAsync(Budget budget);
        Task<IEnumerable<User>> GetAllManagersAsync();
    }
}
