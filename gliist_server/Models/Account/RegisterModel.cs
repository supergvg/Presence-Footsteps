using System.ComponentModel.DataAnnotations;

namespace gliist_server.Models
{
    public class RegisterModel
    {
        [Required(ErrorMessage = "Please enter your email address.")]
        [Display(Name = "User name")]
        [DataType(DataType.EmailAddress)]
        public string UserName { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }

        [Required(ErrorMessage = "Please enter your first name.")]
        public string firstName { get; set; }

        [Required(ErrorMessage = "Please enter your last name.")]
        public string lastName { get; set; }

        [Required(ErrorMessage = "Please enter your company's name.")]
        public string company { get; set; }

        public string token { get; set; }
    }
}