using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;


namespace gliist_server.Models
{
    public class Event
    {
        [JsonIgnore]
        public virtual Company company { get; set; }

        [JsonIgnore]
        public bool isDeleted { get; set; }

        public int id { get; set; }
        [Required]
        public string title { get; set; }

        public string category { get; set; }

        public string description { get; set; }

        public string location { get; set; }

        public int capacity { get; set; }

        public DateTimeOffset time { get; set; }

        public DateTimeOffset endTime { get; set; }

        public int utcOffset { get; set; }

        public virtual List<GuestListInstance> guestLists { get; set; }

        public string invitePicture { get; set; }

        public Event()
        {
            invitePicture = @"https://gliist.blob.core.windows.net/invites/1_61_event_placeholder.jpg";
        }

    }
}