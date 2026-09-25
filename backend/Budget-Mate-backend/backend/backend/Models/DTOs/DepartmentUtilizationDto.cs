namespace backend.Models.DTOs
{
    public class DepartmentUtilizationDto
    {
        public string Name { get; set; }
        public decimal Allocated { get; set; }
        public decimal Spent { get; set; }
        public decimal Remaining => Allocated - Spent;
        public int Utilization => Allocated > 0 ? (int)Math.Round((Spent / Allocated) * 100) : 0;
    }
}
