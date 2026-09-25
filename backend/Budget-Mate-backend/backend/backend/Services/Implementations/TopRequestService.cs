// Services/Implementations/TopRequestService.cs
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using System.Security.Claims;

namespace backend.Services.Implementations
{
    public class TopRequestService : ITopRequestService
    {
        private readonly ITopRequestRepository _repo;
        private readonly IBudgetRepository _budgetRepo; // Add this

        public TopRequestService(ITopRequestRepository repo, IBudgetRepository budgetRepo)
        {
            _repo = repo;
            _budgetRepo = budgetRepo;
        }

        public async Task<TopUpRequest> CreateRequestAsync(TopUpRequestDto dto, ClaimsPrincipal user)
        {
            var lastId = await _repo.GetLastIdAsync();
            int nextNum = int.Parse(lastId.Split('-')[1]) + 1;

            var request = new TopUpRequest
            {
                RequestId = $"REQ-{nextNum}",
                BudgetId = dto.BudgetId,
                Amount = dto.Amount,
                Reason = dto.Reason,
                UserName = dto.UserName ?? user.FindFirstValue(ClaimTypes.Name) ?? "Unknown",

                // 🔹 ADD THESE TWO LINES TO SAVE TO DB
                UserRole = dto.UserRole,
                Department = dto.Department,

                Status = "Pending",
                SubmittedDate = DateTime.Now,
                ApprovingManagerName = dto.ApprovingManagerName
            };

            await _repo.AddAsync(request);
            return request;
        }
        // Services/Implementations/TopRequestService.cs
        public async Task<IEnumerable<TopUpRequest>> GetAllRequestsAsync()
        {
            // Ensure your ITopRequestRepository has a corresponding GetAllAsync method
            return await _repo.GetAllAsync();
        }
        // TopRequestService.cs
        public async Task<bool> UpdateStatusAsync(UpdateStatusDto dto)
        {
            var request = await _repo.GetByIdAsync(dto.RequestId);
            if (request == null) return false;

            request.Status = dto.Status;

            // Save reason ONLY if status is Rejected and a reason was typed
            if (dto.Status == "Rejected")
            {
                request.RejectedReason = !string.IsNullOrEmpty(dto.RejectedReason)
                    ? dto.RejectedReason
                    : "No rejected reason provided";
            }

            await _repo.UpdateAsync(request);
            return true;
        }
        public async Task<bool> ApplyTopUpToBudgetAsync(string budgetId, decimal amount)
        {
            // This logic usually interacts with your IBudgetRepository 
            // to find the budget and add the 'amount' to its current balance.
            return await _repo.UpdateBudgetAmountAsync(budgetId, amount);
        }
        // TopRequestService.cs
        public async Task<IEnumerable<TopUpRequest>> GetRequestsByManagerAsync(ClaimsPrincipal user)
        {
            // Try to get name from multiple claim types to be safe
            var managerName = user.Identity?.Name
                              ?? user.FindFirstValue(ClaimTypes.Name)
                              ?? user.FindFirstValue("name");

            if (string.IsNullOrEmpty(managerName)) return Enumerable.Empty<TopUpRequest>();

            var allRequests = await _repo.GetAllAsync();

            // Use StringComparison.OrdinalIgnoreCase to avoid case-sensitivity issues
            return allRequests.Where(r => string.Equals(r.ApprovingManagerName, managerName, StringComparison.OrdinalIgnoreCase));
        }
    }
}