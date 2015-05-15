using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace gliist_server.Models
{
    public class Invite
    {

        public int id { get; set; }

        public string firstName { get; set; }

        public string lastName { get; set; }

        public string email { get; set; }

        public string phoneNumber { get; set; }

        public string token { get; set; }

        public string[] permissions { get; set; }

        public DateTime? acceptedAt { get; set; }

    }

    public class Company
    {
        public int id { get; set; }

        [Required]
        public string name { get; set; }

        public string logo { get; set; }

        public virtual List<UserModel> users { get; set; }

        public virtual List<Invite> invitations { get; set; }

        public Company()
        {
            users = new List<UserModel>();
            invitations = new List<Invite>();
        }
    }
}