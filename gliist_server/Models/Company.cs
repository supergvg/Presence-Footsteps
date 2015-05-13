using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace gliist_server.Models
{
    public class Company
    {
        public int id { get; set; }

        [Required]
        public string name { get; set; }

        public string logo { get; set; }

        public virtual List<UserModel> users { get; set; }

        public Company()
        {
            users = new List<UserModel>();
        }
    }
}