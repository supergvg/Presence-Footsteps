using System.ComponentModel.DataAnnotations;

namespace gliist_server.Models
{
    public class ExternalRegisterModel : RegisterModel
    {
        [Required(ErrorMessage = "Please enter invite code.")]
        public string inviteCode { get; set; }
    }
}