using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;


namespace gliist_server.Models
{
    public class Event
    {
        [Required]
        public string userId { get; set; }

        public int id { get; set; }
        [Required]
        public string name { get; set; }

        public string description { get; set; }

        public DateTime date { get; set; }

        public IEnumerable<int> guestIds { get; set; }

        public IEnumerable<Guest> guestList { get; set; }

    }
}