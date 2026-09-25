namespace backend.Models.DTOs
{
    public class TopUpRequestDto
    {
        public string BudgetId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string ApprovingManagerName { get; set; } = string.Empty;
        
        public string? UserName { get; set; }
        public string UserRole { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
    }
}
