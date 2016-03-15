using System.ComponentModel.DataAnnotations;
using Microsoft.AspNet.Identity.EntityFramework;
using Newtonsoft.Json;

namespace gliist_server.DataAccess
{
    public class UserModel : IdentityUser
    {
        [Required]
        public string firstName { get; set; }

        [Required]
        public string lastName { get; set; }

        [DataType(DataType.PhoneNumber)]
        public string phoneNumber { get; set; }

        public byte[] profilePictureData { get; set; }

        public string profilePicture { get; set; }

        public string profilePictureUrl { get; set; }

        public string city { get; set; }

        [JsonIgnore]
        public virtual Company company { get; set; }

        public string bio { get; set; }

        public string contactPhone { get; set; }

        public string contactEmail { get; set; }

        public string permissions { get; set; }
    }
}