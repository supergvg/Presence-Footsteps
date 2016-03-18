using gliist_server.DataAccess;

namespace gliist_server.Models
{
    public class GuestEventModel
    {
        public Guest guest { get; set; }
        public int eventId { get; set; }
    }
}
