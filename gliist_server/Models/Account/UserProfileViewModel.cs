using System.ComponentModel.DataAnnotations;

namespace gliist_server.Models
{
    public class UserProfileViewModel
    {
        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        public string PhoneNumber { get; set; }

        public string City { get; set; }

        public string Bio { get; set; }

        public string ContactPhone { get; set; }

        public string ContactEmail { get; set; }
    }
}