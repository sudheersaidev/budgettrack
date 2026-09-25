// Path: backend.Services.Implementations/ExpenseService.cs
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using System.Security.Claims;

namespace backend.Services.Implementations
{
    public class ExpenseService : IExpenseService
    {
        private readonly IExpenseRepository _expenseRepo;
        private readonly IBudgetRepository _budgetRepo;

        public ExpenseService(IExpenseRepository expenseRepo, IBudgetRepository budgetRepo)
        {
            _expenseRepo = expenseRepo;
            _budgetRepo = budgetRepo;
        }

        public async Task<Expense> CreateExpenseAsync(ExpenseCreateDto dto, ClaimsPrincipal user)
        {
            var dept = user.FindFirst("Department")?.Value ?? "";
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

            // 1. Find the budget to identify the owner
            var budgets = await _budgetRepo.GetByDepartmentAsync(dept);
            var targetBudget = budgets.FirstOrDefault(b => b.BudgetId == dto.BudgetId);

            // If budget isn't found, you might want to throw an exception or handle it
            string managerName = targetBudget?.CreatedByManager ?? "Unknown Manager";

            var lastId = await _expenseRepo.GetLastIdAsync();
            int nextNum = int.Parse(lastId.Substring(1)) + 1;

            var expense = new Expense
            {
                ExpenseId = $"E{nextNum}",
                BudgetId = dto.BudgetId,
                Category = dto.Category,
                Description = dto.Description,
                Amount = dto.Amount,
                SubmittedByUserId = userId,
                Department = dept,
                Status = "Pending",
                RejectionReason = "No Rejection",
                SubmittedDate = DateTime.Now,

                // 2. Map the manager name to the Expense entity
                // Note: Ensure your Expense Entity has the ApprovingManagerName property
                ApprovingManagerName = managerName
            };

            await _expenseRepo.AddAsync(expense);
            return expense;
        }
        public async Task<IEnumerable<Expense>> GetDepartmentExpensesAsync(ClaimsPrincipal user)
        {
            var dept = user.FindFirst("Department")?.Value ?? "";
            // This calls the repository method you created earlier
            return await _expenseRepo.GetByDepartmentAsync(dept);
        }
        public async Task<decimal> GetTotalDeptBudgetAsync(ClaimsPrincipal user)
        {
            var dept = user.FindFirst("Department")?.Value ?? "";
            var budgets = await _budgetRepo.GetByDepartmentAsync(dept);

            // 🔹 Returns the sum of allocated amounts for the entire department
            return budgets.Sum(b => b.AmountAllocated);
        }

        public async Task<decimal> GetPendingApprovalsAmountAsync(ClaimsPrincipal user)
        {
            var dept = user.FindFirst("Department")?.Value ?? "";
            var allExpenses = await _expenseRepo.GetByDepartmentAsync(dept);

            // 🔹 Returns the sum of amounts for expenses still in 'Pending' status
            return allExpenses
                .Where(e => e.Status == "Pending")
                .Sum(e => e.Amount);
        }
        public async Task<IEnumerable<Expense>> GetExpensesByDepartmentAsync(ClaimsPrincipal user)
        {
            // 1. Check if the user is an Admin
            bool isAdmin = user.IsInRole("Admin");

            if (isAdmin)
            {
                // 2. If Admin, bypass department filtering and return EVERYTHING
                // Note: You may need to add a GetAllAsync() to your IExpenseRepository
                return await _expenseRepo.GetAllAsync();
            }

            // 3. For Employees/Managers, continue using the Department claim
            var department = user.FindFirstValue("Department");
            return await _expenseRepo.GetByDepartmentAsync(department);
        }
    }
}