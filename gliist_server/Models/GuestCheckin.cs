using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace gliist_server.Models
{
    public class GuestCheckin
    {
        public int id { get; set; }

        [JsonIgnore]
        public virtual GuestListInstance guestList { get; set; }

        public virtual Guest guest { get; set; }

        public DateTime time { get; set; }

        public int plus { get; set; }
    }
}