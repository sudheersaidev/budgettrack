namespace backend.Models.DTOs
{
    public class AdminHeaderStatsDto
    {
        public decimal TotalApprovedExpenses { get; set; }
        public decimal TotalAllocatedBudget { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
    }
}
