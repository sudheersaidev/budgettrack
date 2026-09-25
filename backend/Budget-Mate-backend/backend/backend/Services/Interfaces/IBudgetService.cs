// Path: backend.Services.Interfaces/IBudgetService.cs
using backend.Models.DTOs;
using backend.Models.Entities;
using System.Security.Claims;

namespace backend.Services.Interfaces
{
    public interface IBudgetService
    {
        Task<(bool Success, string Message, Budget? Data)> CreateBudgetAsync(BudgetCreateDto dto, ClaimsPrincipal user);
        Task<IEnumerable<Budget>> GetBudgetsForUserAsync(ClaimsPrincipal user);
        Task<decimal> GetTotalAllocatedAsync();
        Task<decimal> GetTotalClosedAmountAsync();
        Task<(bool Success, string Message)> CloseBudgetAsync(string id);
        Task<bool> UpdateStatusAsync(string id, string newStatus);

        // Add this line to match your implementation
        Task<IEnumerable<BudgetAssignmentDto>> GetActiveBudgetListWithManagerAsync(ClaimsPrincipal user);
        //Task GetActiveBudgetIdListAsync(ClaimsPrincipal user);

        // KEEP THIS ONE (You have logic for this in BudgetService.cs)
        Task<IEnumerable<string>> GetActiveBudgetIdListAsync(ClaimsPrincipal user);


    }
}