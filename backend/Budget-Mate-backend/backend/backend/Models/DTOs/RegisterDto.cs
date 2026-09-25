using backend.Enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string UserID { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; }

        [Required]
        public Department Department { get; set; }
    }
}