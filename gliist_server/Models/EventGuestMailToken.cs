namespace gliist_server.Models
{
    public class EventGuestMailToken
    {
        public string Token { get; set; }
        public string UrlSafeToken { get; set; }
        public int GuestId { get; set; }
        public int EventId { get; set; }
    }
}
