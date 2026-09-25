using backend.Enums;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
    public class ApprovalService : IApprovalService
    {
        private readonly IApprovalRepository _repo;

        public ApprovalService(IApprovalRepository repo)
        {
            _repo = repo;
        }

        //httpsloca/getdeptexpenses

        public async Task<IEnumerable<Expense>> GetDeptExpensesAsync(Department department, string managerName)
        {
            var allDeptExpenses = await _repo.GetExpensesByDepartmentAsync(department.ToString());

            // 🔹 Filter so only requests assigned to THIS manager are shown
            return allDeptExpenses.Where(e => e.ApprovingManagerName == managerName);
        }

        public async Task<DashboardStatsDto> GetStatsAsync(Department department, string managerName)
        {
            // Ensure your repository also filters stats by managerName
            return await _repo.GetDashboardStatsAsync(department.ToString(), managerName);
        }

        public async Task<bool> UpdateStatusAsync(string id, UpdateExpenseStatusDto statusDto)
        {
            var expense = await _repo.GetExpenseByIdAsync(id);
            if (expense == null) return false;

            expense.Status = statusDto.Status;

            if (statusDto.Status == "Rejected")
            {
                expense.RejectionReason = statusDto.RejectionReason ?? "No reason provided";
            }
            else
            {
                // As requested: default text instead of null
                expense.RejectionReason = "No Rejection";
            }

            return await _repo.UpdateExpenseAsync(expense);
        }
    }
}