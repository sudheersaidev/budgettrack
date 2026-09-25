namespace backend.Models.DTOs
{
    public class UpdateExpenseStatusDto
    {
        public string Status { get; set; } = string.Empty; // 🔹 Initialize here
        public string? RejectionReason { get; set; }

    }
}
