using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace gliist_server.Models
{
    public enum RsvpType
    {
        [Description("Confirmed Guests")]
        ConfirmedGuests = 1,

        [Description("Invited Guests")]
        InvitedGuests = 2,

        [Description("Public Guests")]
        PublicGuests = 3
    }
}
