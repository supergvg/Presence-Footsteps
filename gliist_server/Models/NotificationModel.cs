using System;

namespace gliist_server.Models
{
    public class NotificationViewModel
    {
        public string message { get; set; }

        public DateTimeOffset time { get; set; }

        public GuestModel guest { get; set; }

        public GuestListInstanceModel gli { get; set; }
    }
}