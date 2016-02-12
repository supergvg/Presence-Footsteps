using System.Collections.Generic;
using System.Configuration;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using gliist_server.Models;
using SendGrid;

namespace gliist_server.Helpers
{
    public static class EmailHelper
    {
        // http://www.dotnetthoughts.net/how-to-generate-and-read-qr-code-in-asp-net/
        //to store images http://azure.microsoft.com/en-us/documentation/articles/cdn-serve-content-from-cdn-in-your-web-application/
        // QR http://www.dotnetthoughts.net/how-to-generate-and-read-qr-code-in-asp-net/

        //http://azure.microsoft.com/en-us/documentation/articles/storage-dotnet-how-to-use-blobs/ blob

        private const string SendgridUsername = "gliist";
        private const string SendgridPassword = "gliist925$";
        
        public static void SendWelcomeEmail(string to, string website, string userName, string accountLink, string companyName)
        {
            // Create the email object first, then add the properties.
            SendGridMessage myMessage = new SendGridMessage();
            myMessage.AddTo(to);

            myMessage.SetCategories(new List<string> { "Welcome Email", companyName });


            myMessage.From = new MailAddress("admin@gjests.com", "gjests");

            myMessage.Subject = "Welcome to gjests";

            myMessage.Html = "<p></p> ";

            myMessage.EnableTemplateEngine("9389ac57-259a-418c-9e4f-1e478c380a23");


            myMessage.AddSubstitution(":website", new List<string> { website });
            myMessage.AddSubstitution(":login", new List<string> { userName });
            myMessage.AddSubstitution(":account_settings", new List<string> { accountLink });


            // Create credentials, specifying your user name and password.
            var credentials = new NetworkCredential(SendgridUsername, SendgridPassword);

            // Create an Web transport for sending email.
            var transportWeb = new Web(credentials);

            // Send the email.
            // You can also use the **DeliverAsync** method, which returns an awaitable task.
            transportWeb.Deliver(myMessage);
        }

        public static void SendRecoverPassword(string userEmail, string resetLink, string companyName)
        {
            // Create the email object first, then add the properties.
            SendGridMessage myMessage = new SendGridMessage();
            myMessage.AddTo(userEmail);
            myMessage.From = new MailAddress("dont-replay@gjests.com", "gjests");

            myMessage.SetCategories(new List<string> { "Recover Password", companyName });


            myMessage.Subject = string.Format("Recover Password");

            myMessage.Html = "<p></p> ";

            myMessage.EnableTemplateEngine("733fe7c2-df2d-46c7-a76a-8b476b7e0439");


            myMessage.AddSubstitution(":reset_password_link", new List<string> { resetLink });

            myMessage.EnableOpenTracking();
            myMessage.EnableClickTracking();

            // Create credentials, specifying your user name and password.
            var credentials = new NetworkCredential(SendgridUsername, SendgridPassword);

            // Create an Web transport for sending email.
            var transportWeb = new Web(credentials);

            // Send the email.
            // You can also use the **DeliverAsync** method, which returns an awaitable task.
            transportWeb.Deliver(myMessage);
        }

        public static void SendJoinRequest(UserModel to, UserModel from, Invite invite, HttpRequestMessage request)
        {
            // Create the email object first, then add the properties.
            SendGridMessage myMessage = new SendGridMessage();
            myMessage.AddTo(to.UserName);

            myMessage.SetCategories(new List<string> { "Contributor Invitation", @from.company.name });


            myMessage.From = new MailAddress("dontreplay@gjests.com", "gjests");

            myMessage.Subject = string.Format("Contributor Invitation from {0} {1}", @from.firstName, @from.lastName);

            myMessage.Html = "<p></p>";

            myMessage.EnableTemplateEngine("105b490c-8585-4e17-b5e6-ee502c1fac85");

            myMessage.AddSubstitution(":to_first_name", new List<string> { invite.firstName });

            myMessage.AddSubstitution(":company_name", new List<string> { @from.company.name });

            myMessage.AddSubstitution(":permissions", new List<string> { to.permissions });


            myMessage.AddSubstitution(":full_name_from", new List<string> { @from.firstName, @from.lastName });

            myMessage.AddSubstitution(":website", new List<string> { @from.company.name });
            myMessage.AddSubstitution(":login", new List<string> { to.UserName });
            myMessage.AddSubstitution(":account_settings",
                new List<string>
                { 
                    string.Format("{0}/#/signup/invite/{1}/{2}", Config.AppBaseUrl , @from.company.name ,invite.token)
                }
                );


            // Create credentials, specifying your user name and password.
            var credentials = new NetworkCredential(SendgridUsername, SendgridPassword);

            // Create an Web transport for sending email.
            var transportWeb = new Web(credentials);

            // Send the email.
            // You can also use the **DeliverAsync** method, which returns an awaitable task.
            transportWeb.Deliver(myMessage);
        }
    }
}