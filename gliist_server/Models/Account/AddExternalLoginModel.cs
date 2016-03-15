using System.ComponentModel.DataAnnotations;

namespace gliist_server.Models
{
    // Models used as parameters to AccountController actions.

    public class AddExternalLoginModel
    {
        [Required]
        [Display(Name = "External access token")]
        public string ExternalAccessToken { get; set; }
    }
}
