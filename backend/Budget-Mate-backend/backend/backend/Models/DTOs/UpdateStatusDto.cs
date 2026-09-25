namespace backend.Models.DTOs
{
    public class UpdateStatusDto {
        public string RequestId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? RejectedReason { get; set; }
    }
}
