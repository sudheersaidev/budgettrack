namespace backend.Models.DTOs
{
    public class ExpenseCreateDto
    {
        public string BudgetId { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string ApprovingManagerName { get; set; } = string.Empty;
    }
}
