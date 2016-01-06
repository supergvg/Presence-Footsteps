using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class Guest
    {
        [JsonIgnore]
        public virtual Company company { get; set; }

        [JsonIgnore]
        public virtual List<GuestList> linked_guest_lists { get; set; }

        public int id { get; set; }

        [Required]
        public string firstName { get; set; }
        
        public string lastName { get; set; }

        public string phoneNumber { get; set; }

        public string email { get; set; }

        public int plus { get; set; }

        public string type { get; set; }

        public bool isPublicRegistration { get; set; }

        public Guest()
        {
            linked_guest_lists = new List<GuestList>();
            type = "Others";
        }
        
    }
}