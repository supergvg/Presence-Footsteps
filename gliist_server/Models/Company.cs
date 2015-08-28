using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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

        public string permissions { get; set; }

        public DateTimeOffset? acceptedAt { get; set; }

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
            logo = @"https://gliist.blob.core.windows.net/invites/1_61_event_placeholder.jpg";
            name = " ";
        }


        public override int GetHashCode()
        {
            return id;
        }

        public override bool Equals(object obj)
        {
            var company = obj as Company;

            if (company == null)
            {
                return false;
            }

            return company.id == this.id;
        }
    }
}