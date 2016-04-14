using System.Net;
using SendGrid;

namespace gliist_server.Models
{
    static class SendGridSender
    {
        private const string Username = "gliist";
        private const string Password = "gliist925$";

        public static void Run(ISendGrid message)
        {
            var credentials = new NetworkCredential(Username, Password);
            var transportWeb = new Web(credentials);
            transportWeb.DeliverAsync(message);
        }
    }
}