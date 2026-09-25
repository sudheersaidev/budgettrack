using backend.Data;
using backend.Enums;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace backend.Repositories.Implementations
{
    public class SqlBudgetRepository:IBudgetRepository
    {
        private readonly BudgetDbContext _context;

        public SqlBudgetRepository(BudgetDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddBudgetAsync(Budget budget)
        {
            await _context.Budgets.AddAsync(budget);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Budget>> GetAllBudgetsAsync()
        {
            return await _context.Budgets.ToListAsync();
        }

        public async Task<IEnumerable<Budget>> GetByDepartmentAsync(string department)
        {
            if (Enum.TryParse<Enums.Department>(department, true, out var deptEnum))
            {
                return await _context.Budgets
                    //this will include the related AssignedEmployees data when fetching budgets by department
                 //it will budget data along with the list of employees assigned to each budget using sql join
                    .Include(b => b.AssignedEmployees) 
                    .Where(b => b.Department == deptEnum)
                    .ToListAsync();
            }
            return new List<Budget>();
        }

        public async Task<decimal> GetTotalBudgetAllocatedAsync()
        {
            return await _context.Budgets.SumAsync(b => b.AmountAllocated);
        }
        public async Task<decimal> GetTotalClosedApprovalsAsync()
        {
            // This queries the Budgets table and sums AmountAllocated for 'Closed' entries
            return await _context.Budgets
                .Where(b => b.Status == "Closed")
                .SumAsync(b => b.AmountAllocated);
        }

        public async Task<Budget?> GetByIdAsync(string budgetId)
        {
            return await _context.Budgets.FindAsync(budgetId);
        }

        public async Task<bool> UpdateBudgetAsync(Budget budget)
        {
            _context.Budgets.Update(budget);
            return await _context.SaveChangesAsync() > 0;
        }
        // to check whether a budget with the same ID already exists before creating a new one
        public async Task<bool> ExistsAsync(string budgetId)
        {
            return await _context.Budgets.AnyAsync(b => b.BudgetId == budgetId);
        }

        
    }
}
