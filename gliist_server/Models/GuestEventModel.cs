namespace gliist_server.Models
{
    public class GuestEventModel
    {
        public Guest guest { get; set; }
        public int eventId { get; set; }
    }


    public class GuestsEventModel
    {
        public string names { get; set; }
        public string type { get; set; }
        public int eventId { get; set; }
    }
}
