using backend.Enums;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using System.Security.Claims;

namespace backend.Services.Implementations
{
    public class BudgetService : IBudgetService
    {
        private readonly IBudgetRepository _budgetRepo;

        public BudgetService(IBudgetRepository budgetRepo)
        {
            _budgetRepo = budgetRepo;
        }

        public async Task<(bool Success, string Message, Budget? Data)> CreateBudgetAsync(BudgetCreateDto dto, ClaimsPrincipal user)
        {
            var managerName = user.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown Manager";
            var userDeptClaim = user.FindFirst("Department")?.Value;

            if (userDeptClaim != dto.Department.ToString())
            {
                return (false, "You can only create budgets for your own department.", null);
            }

            //to check whether a budget is already exists with the same ID
            if (await _budgetRepo.ExistsAsync(dto.BudgetId))
            {
                return (false, $"A budget with ID '{dto.BudgetId}' already exists.", null);
            }

            var budget = new Budget
            {
                BudgetId = dto.BudgetId,
                Title = dto.Title,
                Department = dto.Department,
                AmountAllocated = dto.AmountAllocated,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = "Active",
                CreatedByManager = managerName,
                AssignedEmployees = dto.AssignedEmployees.Select(e => new BudgetAssignment
                {
                    BudgetId = dto.BudgetId,
                    EmployeeId = e.UserID,
                    EmployeeName = e.Name
                }).ToList()
            };

            var result = await _budgetRepo.AddBudgetAsync(budget);

            return result
                ? (true, "Budget created and employees assigned successfully!", budget)
                : (false, "Could not create budget in the database.", null);
        }

        public async Task<IEnumerable<Budget>> GetBudgetsForUserAsync(ClaimsPrincipal user)
        {
            // Check if the user is an Admin first
            if (user.IsInRole("Admin"))
            {
                return await _budgetRepo.GetAllBudgetsAsync();
            }

            var userDeptClaim = user.FindFirst("Department")?.Value;

            // If Manager has no dept claim, they also see all (based on your existing logic)
            if (user.IsInRole("Manager") && string.IsNullOrEmpty(userDeptClaim))
            {
                return await _budgetRepo.GetAllBudgetsAsync();
            }

            return await _budgetRepo.GetByDepartmentAsync(userDeptClaim ?? "");
        }

        public async Task<decimal> GetTotalAllocatedAsync() => await _budgetRepo.GetTotalBudgetAllocatedAsync();

        public async Task<decimal> GetTotalClosedAmountAsync() => await _budgetRepo.GetTotalClosedApprovalsAsync();

        public async Task<(bool Success, string Message)> CloseBudgetAsync(string id)
        {
            var budget = await _budgetRepo.GetByIdAsync(id);
            if (budget == null) return (false, "Budget not found.");

            budget.Status = "Closed";
            var result = await _budgetRepo.UpdateBudgetAsync(budget);
            return result ? (true, "Success") : (false, "Update failed.");
        }

        public async Task<bool> UpdateStatusAsync(string id, string newStatus)
        {
            var budget = await _budgetRepo.GetByIdAsync(id);
            if (budget == null) return false;

            budget.Status = newStatus;
            return await _budgetRepo.UpdateBudgetAsync(budget);
        }

        // Optimized single method to return Budget IDs and Manager Names
        public async Task<IEnumerable<BudgetAssignmentDto>> GetActiveBudgetListWithManagerAsync(ClaimsPrincipal user)
        {
            var employeeId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userDeptClaim = user.FindFirst("Department")?.Value;

            if (string.IsNullOrEmpty(employeeId) || string.IsNullOrEmpty(userDeptClaim))
            {
                return Enumerable.Empty<BudgetAssignmentDto>();
            }

            // Note: Repository must include AssignedEmployees in this call
            var budgets = await _budgetRepo.GetByDepartmentAsync(userDeptClaim);

            return budgets
                .Where(b => b.Status.Equals("Active", StringComparison.OrdinalIgnoreCase))
                .Where(b => b.AssignedEmployees.Any(a => a.EmployeeId.Trim() == employeeId.Trim()))
                .Select(b => new BudgetAssignmentDto
                {
                    BudgetId = b.BudgetId,
                    ManagerName = b.CreatedByManager // Maps the creator's name to the Manager field
                });
        }
        public async Task<IEnumerable<string>> GetActiveBudgetIdListAsync(ClaimsPrincipal user)
        {
            IEnumerable<Budget> budgets;

            if (user.IsInRole("Admin"))
            {
                budgets = await _budgetRepo.GetAllBudgetsAsync();
            }
            else
            {
                var dept = user.FindFirst("Department")?.Value ?? "";
                budgets = await _budgetRepo.GetByDepartmentAsync(dept);
            }

            return budgets
                .Where(b => b.Status.Equals("Active", StringComparison.OrdinalIgnoreCase))
                .Select(b => b.BudgetId);
        }
    }
}