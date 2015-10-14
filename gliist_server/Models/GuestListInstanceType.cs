using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace gliist_server.Models
{
    public enum GuestListInstanceType
    {
        Default = 0,
        Confirmed = 1,
        Rsvp = 2,
        Ticketing = 3,
        PublicRsvp = 4
    }
}
