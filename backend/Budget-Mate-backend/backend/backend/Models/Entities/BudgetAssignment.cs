using System.ComponentModel.DataAnnotations;

namespace backend.Models.Entities
{
    public class BudgetAssignment
    {
        [Key]
        public int Id { get; set; }
        public string BudgetId { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
    }
}
