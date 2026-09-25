namespace backend.Models.Entities
{
    public class LoginLog
    {
        public int LogID { get; set; }
        public string UserID { get; set; } // Matches your User.UserID
        public DateTime LoginTime { get; set; }

        // Navigation property to get User details (Name, Role) easily
        public virtual User User { get; set; }
    }
}
