using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
    public interface IExpenseRepository
    {
        Task<IEnumerable<Expense>> GetByDepartmentAsync(string dept);
        Task AddAsync(Expense expense);
        Task<string> GetLastIdAsync();
        Task<IEnumerable<Expense>> GetAllAsync();
    }
}
