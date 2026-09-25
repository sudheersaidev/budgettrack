using backend.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Entities
{
    public class Budget
    {
        //it is important to use the same name as the property in the DTO for model binding to
        //work correctly when creating budgets via API
        //primary key for the budget table
        [Key]
        //here we are using 
        [DatabaseGenerated(DatabaseGeneratedOption.None)] // Because you use custom IDs like "BUD001"
        public required string BudgetId { get; set; }

        [Required]
        public required string Title { get; set; }

        [Required]
        public Department Department { get; set; } // Uses your existing Enum

        [Required]
        //eg: 10000000000.00
        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountAllocated { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public string Status { get; set; } = "Active";
        // NEW FIELDS
        [Required]
        public string CreatedByManager { get; set; } = string.Empty;

        // One budget can have multiple employees assigned
        public List<BudgetAssignment> AssignedEmployees { get; set; } = new();
    }
}
