using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IFinancialService
    {
        Task<AdminHeaderStatsDto> GetAdminStatsAsync();
        Task<IEnumerable<DepartmentUtilizationDto>> GetDepartmentalStatsAsync();

        // Add this method:
        Task<(bool Success, string Message)> TransferBudgetOwnershipAsync(TransferBudgetDto dto);
    }
}