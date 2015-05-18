﻿using System;
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

        public int id { get; set; }
        [Required]
        public string title { get; set; }

        public string category { get; set; }

        public string description { get; set; }

        public string location { get; set; }

        public int capacity { get; set; }

        public DateTime date { get; set; }

        public DateTime time { get; set; }

        public DateTime? endTime { get; set; }

        public virtual List<GuestListInstance> guestLists { get; set; }

        public string invitePicture { get; set; }

        public Event()
        {
            invitePicture = @"https://gliist.blob.core.windows.net/invites/1_61_event_placeholder.jpg";
        }

    }
}