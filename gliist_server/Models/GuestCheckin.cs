using System;
using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class GuestCheckin
    {
        public int id { get; set; }

        [JsonIgnore]
        public virtual GuestListInstance guestList { get; set; }

        public int gl_id { get { return guestList != null ? guestList.id : -1; } }

        public virtual Guest guest { get; set; }

        public DateTimeOffset? time { get; set; }

        public string status { get; set; }

        public int plus { get; set; }


        public GuestCheckin()
        {
            status = "no show";
        }
    }
}