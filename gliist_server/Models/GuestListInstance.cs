using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace gliist_server.Models
{
    public class GuestListInstance
    {
        public int id { get; set; }

        [JsonIgnore]
        public virtual Event linked_event { get; set; }

        public virtual GuestList linked_guest_list { get; set; }

        public virtual List<GuestCheckin> actual { get; set; }

    }
}