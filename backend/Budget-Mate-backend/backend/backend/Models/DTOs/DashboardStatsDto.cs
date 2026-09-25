namespace backend.Models.DTOs
{
    public class DashboardStatsDto
    {
        public decimal TotalDeptBudget { get; set; }
        public decimal PendingApprovals { get; set; }
        public string Department { get; set; } = string.Empty;
        public decimal TotalExpenseAmount { get; set; } 
    }
}
