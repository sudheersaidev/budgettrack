using backend.Models.Entities; // 🔹 Needed for Expense
using backend.Models.DTOs;     // 🔹 Needed for ExpenseCreateDto
using System.Security.Claims;  // 🔹 Needed for ClaimsPrincipal
using System.Threading.Tasks;  // 🔹 Needed for Task

namespace backend.Services.Interfaces
{
    public interface IExpenseService
    {
        Task<Expense> CreateExpenseAsync(ExpenseCreateDto dto, ClaimsPrincipal user);

        // You might also need this to fix the ₹ 0 dashboard issue
        Task<IEnumerable<Expense>> GetDepartmentExpensesAsync(ClaimsPrincipal user);
        // 🔹 New method for Dashboard stats
        // 🔹 Separated methods
        Task<decimal> GetTotalDeptBudgetAsync(ClaimsPrincipal user);
        Task<decimal> GetPendingApprovalsAmountAsync(ClaimsPrincipal user);
        Task<IEnumerable<Expense>> GetExpensesByDepartmentAsync(ClaimsPrincipal user);
    }
}