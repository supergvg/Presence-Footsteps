using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using gliist_server.DataAccess;
using SendGrid;

namespace gliist_server.Helpers
{
    static class EmailHelper
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
            var message = new SendGridMessage();
            message.AddTo(to);

            message.SetCategories(new List<string> { "Welcome Email", companyName });


            message.From = new MailAddress("admin@gjests.com", "gjests");

            message.Subject = "Welcome to gjests";

            message.Html = "<p></p> ";

            message.EnableTemplateEngine("9389ac57-259a-418c-9e4f-1e478c380a23");


            message.AddSubstitution(":website", new List<string> { website });
            message.AddSubstitution(":login", new List<string> { userName });
            message.AddSubstitution(":account_settings", new List<string> { accountLink });

            SendEmail(message);
        }

        public static void SendRecoverPassword(string userEmail, string resetLink, string companyName)
        {
            // Create the email object first, then add the properties.
            var message = new SendGridMessage();
            message.AddTo(userEmail);
            message.From = new MailAddress("dont-replay@gjests.com", "gjests");

            message.SetCategories(new List<string> { "Recover Password", companyName });


            message.Subject = string.Format("Recover Password");

            message.Html = "<p></p> ";

            message.EnableTemplateEngine("733fe7c2-df2d-46c7-a76a-8b476b7e0439");


            message.AddSubstitution(":reset_password_link", new List<string> { resetLink });

            message.EnableOpenTracking();
            message.EnableClickTracking();

            SendEmail(message);
        }

        public static void SendJoinRequest(UserModel to, UserModel from, Invite invite, HttpRequestMessage request)
        {
            // Create the email object first, then add the properties.
            var message = new SendGridMessage();
            message.AddTo(to.UserName);

            message.SetCategories(new List<string> {"Contributor Invitation", @from.company.name});


            message.From = new MailAddress("dontreplay@gjests.com", "gjests");

            message.Subject = string.Format("Contributor Invitation from {0} {1}", @from.firstName, @from.lastName);

            message.Html = "<p></p>";

            message.EnableTemplateEngine("105b490c-8585-4e17-b5e6-ee502c1fac85");

            message.AddSubstitution(":to_first_name", new List<string> {invite.firstName});

            message.AddSubstitution(":company_name", new List<string> {@from.company.name});

            message.AddSubstitution(":permissions", new List<string> {to.permissions});


            message.AddSubstitution(":full_name_from", new List<string> {@from.firstName, @from.lastName});

            message.AddSubstitution(":website", new List<string> {@from.company.name});
            message.AddSubstitution(":login", new List<string> {to.UserName});
            message.AddSubstitution(":account_settings", new List<string>
            {
                string.Format("{0}/#/signup/invite/{1}/{2}", Config.AppBaseUrl, @from.company.name, invite.token)
            }
            );

            SendEmail(message);
        }

        public static void SendAccountDeleted(DeletedAccountInfo info)
        {
            // Create the email object first, then add the properties.
            var message = new SendGridMessage();
            message.AddTo(info.UserEmail);
            message.From = new MailAddress("dont-replay@gjests.com", "gjests");

            message.SetCategories(new List<string> {"Account Deleted", info.CompanyName, info.UserEmail});

            message.Subject = string.Format("Account Deleted");

            message.Html = "<p></p> ";

            message.EnableTemplateEngine("a5c04d64-dd3a-4e7d-813e-a9239957e444");

            message.EnableOpenTracking();
            message.EnableClickTracking();

            SendEmail(message);
        }

        private static void SendEmail(ISendGrid message)
        {
            // Create credentials, specifying your user name and password.
            var credentials = new NetworkCredential(SendgridUsername, SendgridPassword);

            // Create an Web transport for sending email.
            var transportWeb = new Web(credentials);

            // Send the email.
            // You can also use the **DeliverAsync** method, which returns an awaitable task.
            transportWeb.Deliver(message);
        }

        internal class DeletedAccountInfo
        {
            public string UserEmail { get; set; }
            public string CompanyName { get; set; }
        }
    }
}