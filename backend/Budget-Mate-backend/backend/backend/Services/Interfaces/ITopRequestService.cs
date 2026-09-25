using backend.Models.DTOs;
using backend.Models.Entities;
using System.Security.Claims;

namespace backend.Services.Interfaces
{
    public interface ITopRequestService
    {
        Task<TopUpRequest> CreateRequestAsync(TopUpRequestDto dto, ClaimsPrincipal user);
        Task<IEnumerable<TopUpRequest>> GetAllRequestsAsync();
        Task<bool> UpdateStatusAsync(UpdateStatusDto dto);
        Task<bool> ApplyTopUpToBudgetAsync(string budgetId, decimal amount);
        Task<IEnumerable<TopUpRequest>> GetRequestsByManagerAsync(ClaimsPrincipal user);
    }
}
