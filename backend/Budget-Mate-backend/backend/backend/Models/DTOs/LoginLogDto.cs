namespace backend.Models.DTOs
{
    public class LoginLogDto
    {
        public int Id { get; set; }
        public string UserID { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public string Department { get; set; }
        public string Status { get; set; }
        public string Email { get; set; }
        public DateTime LoginTime { get; set; }
    }
}
