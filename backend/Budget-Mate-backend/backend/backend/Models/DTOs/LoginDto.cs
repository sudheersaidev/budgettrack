using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class LoginDto
    {
        [Required, EmailAddress]
        public required string Email { get; set; } // Added 'required'

        [Required]
        public required string Password { get; set; } 
    }
}
