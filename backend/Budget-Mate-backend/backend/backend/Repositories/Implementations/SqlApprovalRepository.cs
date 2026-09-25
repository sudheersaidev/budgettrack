using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.Entities;
using backend.Models.DTOs;
using backend.Repositories.Interfaces;

namespace backend.Repositories.Implementations
{
    public class SqlApprovalRepository : IApprovalRepository
    {
        private readonly BudgetDbContext _context;

        public SqlApprovalRepository(BudgetDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Expense>> GetExpensesByDepartmentAsync(string department)
        {
            // Returns all expenses filtered by the specific department
            return await _context.Expenses
                .Where(e => e.Department == department)
                .ToListAsync();
        }

        public async Task<Expense?> GetExpenseByIdAsync(string id)
        {
            // Standard lookup by primary key
            return await _context.Expenses.FindAsync(id);
        }

        public async Task<bool> UpdateExpenseAsync(Expense expense)
        {
            // Marks the entity as modified and saves changes to the database
            _context.Expenses.Update(expense);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(string department, string managerName)
        {
            // 🔹 Filter by BOTH Department AND the specific Manager
            var expensesQuery = _context.Expenses
                .Where(e => e.Department == department && e.ApprovingManagerName == managerName);

            return new DashboardStatsDto
            {
                Department = department,
                TotalDeptBudget = await expensesQuery
                    .Where(e => e.Status == "Approved")
                    .SumAsync(e => e.Amount),

                PendingApprovals = await expensesQuery
                    .Where(e => e.Status == "Pending")
                    .SumAsync(e => e.Amount),

                TotalExpenseAmount = await expensesQuery.SumAsync(e => e.Amount)
            };
        }
    }
}