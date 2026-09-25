using backend.Enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.Entities
{
    public class User
    {
        [Key]
        public required string UserID { get; set; }
        [Required]
        public required string Name { get; set; }
        [Required, EmailAddress]
        public required string Email { get; set; }
        [Required]
        public required string PasswordHash { get; set; }
        [Required]

        //enums
        public UserRole Role { get; set; } // Change from string to UserRole

        //Enums
        public Department Department { get; set; }
        public string Status { get; set; } = "Active";
    }
}
