using System.ComponentModel.DataAnnotations;

namespace gliist_server.Models
{
    public class RegisterExternalBindingModel
    {
        [Required]
        [Display(Name = "User name")]
        public string UserName { get; set; }
    }
}