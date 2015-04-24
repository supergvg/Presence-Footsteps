﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace gliist_server.Models
{
    public class GuestList
    {
        public string userId { get; set; }
        public int id { get; set; }

        public string listType { get; set; }

        public string title { get; set; }

        public virtual List<Guest> guests { get; set; }
    }
}