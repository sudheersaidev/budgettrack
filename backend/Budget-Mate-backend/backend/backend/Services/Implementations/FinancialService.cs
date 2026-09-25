using backend.Models.DTOs;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
    public class FinancialService : IFinancialService
    {
        private readonly IFinancialRepository _repo;
        public FinancialService(IFinancialRepository repo) => _repo = repo;

        public async Task<AdminHeaderStatsDto> GetAdminStatsAsync()
        {
            return new AdminHeaderStatsDto
            {
                TotalApprovedExpenses = await _repo.GetTotalApprovedExpensesAsync(),
                TotalAllocatedBudget = await _repo.GetTotalAllocatedBudgetAsync(),
                ApprovedCount = await _repo.GetCountByStatusAsync("Approved"),
                RejectedCount = await _repo.GetCountByStatusAsync("Rejected")
            };
        }

        public async Task<IEnumerable<DepartmentUtilizationDto>> GetDepartmentalStatsAsync()
        {
            return await _repo.GetDepartmentalUtilizationAsync();
        }

        // FinancialService.cs
        public async Task<(bool Success, string Message)> TransferBudgetOwnershipAsync(TransferBudgetDto dto)
        {
            var budget = await _repo.GetBudgetByIdAsync(dto.BudgetId);
            if (budget == null) return (false, "Budget not found.");

            // RULE 1: Prevent Self-Transfer
            if (budget.CreatedByManager.Trim().Equals(dto.NewManagerName.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return (false, $"Transfer failed: {dto.NewManagerName} is already the owner of this budget.");
            }

            // RULE 2: Department Validation
            var allManagers = await _repo.GetAllManagersAsync();
            var newManager = allManagers.FirstOrDefault(m => m.Name == dto.NewManagerName);

            if (newManager == null) return (false, "Target manager not found.");

            // Compare budget department with new manager's department
            if (!budget.Department.ToString().Equals(newManager.Department.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                return (false, $"Transfer blocked: Budget belongs to {budget.Department}, but {dto.NewManagerName} is in {newManager.Department}.");
            }

            // RULE 3: Pending Expenses Check
            if (await _repo.HasPendingExpensesAsync(dto.BudgetId))
            {
                return (false, "Transfer blocked: This budget has expenses awaiting approval.");
            }

            budget.CreatedByManager = dto.NewManagerName;
            var result = await _repo.UpdateBudgetAsync(budget);

            return result ? (true, "Manager updated successfully!") : (false, "Database update failed.");
        }
    }
}