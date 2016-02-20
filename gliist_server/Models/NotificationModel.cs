using System;

namespace gliist_server.Models
{
    public class NotificationModel
    {
        public NotificationModel()
        {
            time = DateTimeOffset.Now;
        }

        public string message { get; set; }

        public DateTimeOffset time { get; set; }

        public GuestModel guest { get; set; }

        public GuestListInstanceModel gli { get; set; }
    }
}