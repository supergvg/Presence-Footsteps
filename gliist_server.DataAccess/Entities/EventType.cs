using System.ComponentModel;

namespace gliist_server.DataAccess
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
