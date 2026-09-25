using backend.Models.DTOs;
using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
    public interface IApprovalRepository
    {
        Task<IEnumerable<Expense>> GetExpensesByDepartmentAsync(string department);
        Task<Expense?> GetExpenseByIdAsync(string id);
        Task<bool> UpdateExpenseAsync(Expense expense);
       
        Task<DashboardStatsDto> GetDashboardStatsAsync(string department, string managerName);
    }
}
