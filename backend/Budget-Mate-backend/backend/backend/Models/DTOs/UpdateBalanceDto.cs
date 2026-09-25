namespace backend.Models.DTOs
{
    public class UpdateBalanceDto
    {
        public string BudgetId { get; set; } = ""; 
        public decimal Amount { get; set; }
    }
}
