using backend.Enums;
using backend.Models.DTOs;
using backend.Models.Entities;

namespace backend.Services.Implementations
{
    public interface IApprovalService
    {
     
        Task<IEnumerable<Expense>> GetDeptExpensesAsync(Department department, string managerName);
        Task<DashboardStatsDto> GetStatsAsync(Department department, string managerName);
        Task<bool> UpdateStatusAsync(string id, UpdateExpenseStatusDto statusDto);

    }
}
