using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace gliist_server.Models
{
    public class EventGuestMailToken
    {
        public EventGuestMailToken()
        {
        }

        public string Token { get; set; }
        public string UrlSafeToken { get; set; }
        public int GuestId { get; set; }
        public int EventId { get; set; }
    }
}
