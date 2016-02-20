using System.ComponentModel;

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
