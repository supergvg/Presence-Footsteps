using System.ComponentModel.DataAnnotations;

namespace gliist_server.Models
{
    public class ExternalRegisterModel : RegisterModel
    {
        [Required(ErrorMessage = "Invite code is required.")]
        public string inviteCode { get; set; }
    }
}