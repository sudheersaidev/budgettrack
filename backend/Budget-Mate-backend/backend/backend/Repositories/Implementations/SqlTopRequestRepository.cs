using backend.Data;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implementations
{
    public class SqlTopRequestRepository : ITopRequestRepository
    {
        private readonly BudgetDbContext _context;

        public SqlTopRequestRepository(BudgetDbContext context) => _context = context;

        public async Task<IEnumerable<TopUpRequest>> GetAllAsync()
            => await _context.TopUpRequests.ToListAsync();

        public async Task AddAsync(TopUpRequest request)
        {
            await _context.TopUpRequests.AddAsync(request);
            await _context.SaveChangesAsync();
        }

        public async Task<TopUpRequest?> GetByIdAsync(string requestId)
            => await _context.TopUpRequests.FindAsync(requestId);

        public async Task<string> GetLastIdAsync()
        {
            var last = await _context.TopUpRequests
                .OrderByDescending(r => r.RequestId)
                .FirstOrDefaultAsync();
            return last?.RequestId ?? "REQ-1000";
        }

        public async Task UpdateAsync(TopUpRequest request)
        {
            _context.TopUpRequests.Update(request);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateBudgetAmountAsync(string budgetId, decimal amount)
        {
            var budget = await _context.Budgets
                .FirstOrDefaultAsync(b => b.BudgetId == budgetId);

            if (budget == null) return false;

            budget.AmountAllocated += amount;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task UpdateStatusAsync(string requestId, string status)
        {
            var request = await _context.TopUpRequests.FindAsync(requestId);
            if (request != null)
            {
                request.Status = status;
                await _context.SaveChangesAsync();
            }
        }
    }
}