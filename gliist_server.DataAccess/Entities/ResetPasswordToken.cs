using System;

namespace gliist_server.Models
{
    public class ResetPasswordToken
    {
        public int id { get; set; }
        public DateTimeOffset created_at { get; set; }

        public string user_email { get; set; }

        public string token { get; set; }

        public ResetPasswordToken()
        {
            created_at = DateTimeOffset.Now;
        }
    }
}