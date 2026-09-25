// path: backend/Repositories/Implementations/SqlFinancialRepository.cs
using backend.Data;
using backend.Enums;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implementations
{
    public class SqlFinancialRepository : IFinancialRepository
    {
        private readonly BudgetDbContext _context;
        public SqlFinancialRepository(BudgetDbContext context) => _context = context;

        public async Task<decimal> GetTotalApprovedExpensesAsync()
        {
            return await _context.Expenses
                .Where(e => e.Status == "Approved")
                .SumAsync(e => (decimal)e.Amount);
        }

        public async Task<int> GetCountByStatusAsync(string status)
        {
            return await _context.Expenses
                .CountAsync(e => e.Status == status);
        }

        public async Task<decimal> GetTotalAllocatedBudgetAsync()
        {
            return await _context.Budgets
                .SumAsync(b => b.AmountAllocated);
        }

        public async Task<IEnumerable<DepartmentUtilizationDto>> GetDepartmentalUtilizationAsync()
        {
            var budgetData = await _context.Budgets
                .Select(b => new
                {
                    DeptEnum = b.Department,
                    b.AmountAllocated,
                    Spent = _context.Expenses
                        .Where(e => e.BudgetId == b.BudgetId && e.Status == "Approved")
                        .Sum(e => (decimal?)e.Amount) ?? 0
                })
                .ToListAsync();

            return budgetData
                .GroupBy(x => x.DeptEnum.ToString())
                .Select(group => new DepartmentUtilizationDto
                {
                    Name = group.Key,
                    Allocated = group.Sum(x => x.AmountAllocated),
                    Spent = group.Sum(x => x.Spent)
                })
                .ToList();
        }

        public async Task<Budget?> GetBudgetByIdAsync(string budgetId)
        {
            return await _context.Budgets.FirstOrDefaultAsync(b => b.BudgetId == budgetId);
        }

        public async Task<bool> HasPendingExpensesAsync(string budgetId)
        {
            return await _context.Expenses
                .AnyAsync(e => e.BudgetId == budgetId && e.Status == "Pending");
        }

        public async Task<bool> UpdateBudgetAsync(Budget budget)
        {
            _context.Budgets.Update(budget);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<User>> GetAllManagersAsync()
        {
            return await _context.Users
                .Where(u => u.Role == UserRole.Manager)
                .ToListAsync();
        }
    }
}