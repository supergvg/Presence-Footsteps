using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace gliist_server.Models
{
    public class Guest
    {
        public string userId { get; set; }

        [JsonIgnore]
        public virtual List<GuestList> linked_guest_lists { get; set; }

        public int id { get; set; }
        [Required]
        public string firstName { get; set; }
        [Required]
        public string lastName { get; set; }

        public string phoneNumber { get; set; }

        [Required]
        public string email { get; set; }

        public int plus { get; set; }

    }
}