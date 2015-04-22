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
        public string userId { get; set; }

        public int id { get; set; }
        [Required]
        public string title { get; set; }

        public string category { get; set; }

        public string description { get; set; }

        public string location { get; set; }

        public int capacity { get; set; }

        public DateTime date { get; set; }

        public DateTime time { get; set; }

        public virtual List<GuestList> guestLists { get; set; }

    }
}