using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Entities
{
    public class Expense
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)] // Manual ID like E3001
        public string ExpenseId { get; set; } = string.Empty;

        [Required]
        public string BudgetId { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public string SubmittedByUserId { get; set; } = string.Empty;

        public DateTime SubmittedDate { get; set; } = DateTime.Now;

        public string Status { get; set; } = "Pending";

        public string Department { get; set; } = string.Empty;

        // To store manager feedback when an expense is rejected
        public string RejectionReason { get; set; } = "No Rejection";

        public string ApprovingManagerName { get; set; } = string.Empty;
    }
}