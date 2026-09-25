// Path: backend.Repositories.Implementations/SqlExpenseRepository.cs
using backend.Data;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore; // 🔹 Fixed: Required for Async extension methods

namespace backend.Repositories.Implementations
{
    public class SqlExpenseRepository : IExpenseRepository
    {
        private readonly BudgetDbContext _context; // 🔹 Match your actual DbContext name

        public SqlExpenseRepository(BudgetDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Expense>> GetByDepartmentAsync(string dept)
        {
            return await _context.Expenses
                .Where(e => e.Department == dept)
                .OrderByDescending(e => e.SubmittedDate)
                .ToListAsync();
        }

        public async Task AddAsync(Expense expense)
        {
            await _context.Expenses.AddAsync(expense);
            await _context.SaveChangesAsync();
        }

        public async Task<string> GetLastIdAsync()
        {
            var last = await _context.Expenses
                .OrderByDescending(e => e.ExpenseId)
                .FirstOrDefaultAsync();
                
            return last?.ExpenseId ?? "E3000";
        }
        public async Task<IEnumerable<Expense>> GetAllAsync()
        {
            return await _context.Expenses
                .OrderByDescending(e => e.SubmittedDate)
                .ToListAsync();
        }
    }
}