using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNet.Identity.EntityFramework;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations.Schema;


namespace gliist_server.Models
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

        public string city { get; set; }

        [JsonIgnore]
        public virtual Company company { get; set; }

        public string bio { get; set; }

        public string permissions { get; set; }
    }
}