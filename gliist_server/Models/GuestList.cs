using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace gliist_server.Models
{
    public class GuestList
    {
        public int id { get; set; }

        public string listType { get; set; }

        public string title { get; set; }

        public List<Guest> guests { get; set; }

    }
}