using System;

namespace gliist_server.DataAccess
{
    public class Invite
    {
        public int id { get; set; }

        public string firstName { get; set; }

        public string lastName { get; set; }

        public string email { get; set; }

        public string phoneNumber { get; set; }

        public string token { get; set; }

        public string permissions { get; set; }

        public DateTimeOffset? acceptedAt { get; set; }

    }
}
