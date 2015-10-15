using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace gliist_server.Models
{
    public enum EventType
    {
        [Description("Private Event")]
        Private = 1,

        [Description("RSVP Event")]
        Rsvp = 2,

        [Description("Ticketing Event")]
        Ticketing = 3
    }
}
