using System;

namespace gliist_server.Models
{
    public class NotificationViewModel
    {
        public string message { get; set; }

        public DateTimeOffset time { get; set; }

        public GuestViewModel guest { get; set; }

        public GuestListInstanceViewModel gli { get; set; }
    }
}