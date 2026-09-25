using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Entities
{
    public class TopUpRequest
    {
        [Key]
        //the database should not automatically generate the ID for this field.
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public string RequestId { get; set; } = string.Empty;

        [Required]
        public string BudgetId { get; set; } = string.Empty;

        public string UserName { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
        public DateTime SubmittedDate { get; set; } = DateTime.Now;
        public string? RejectedReason { get; set; }
        public string ApprovingManagerName { get; set; } = string.Empty;
    }
}
