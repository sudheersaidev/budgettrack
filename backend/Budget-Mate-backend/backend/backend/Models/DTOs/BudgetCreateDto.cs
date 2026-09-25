using backend.Enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class BudgetCreateDto
    {
        [Required]
        public string BudgetId { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public Department Department { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal AmountAllocated { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
        // ADD THIS PROPERTY TO FIX THE CS1061 ERROR
        public List<EmployeeAssignmentDto> AssignedEmployees { get; set; } = new();
    }
}
