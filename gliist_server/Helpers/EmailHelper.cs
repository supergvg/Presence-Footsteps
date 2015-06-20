using gliist_server.Models;
using SendGrid;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Web;
using ZXing;

namespace gliist_server.Helpers
{
    public static class EmailHelper
    {
        // http://www.dotnetthoughts.net/how-to-generate-and-read-qr-code-in-asp-net/
        //to store images http://azure.microsoft.com/en-us/documentation/articles/cdn-serve-content-from-cdn-in-your-web-application/
        // QR http://www.dotnetthoughts.net/how-to-generate-and-read-qr-code-in-asp-net/

        //http://azure.microsoft.com/en-us/documentation/articles/storage-dotnet-how-to-use-blobs/ blob

        private static string UploadQRCode(int eventId, int guestId, int gliId)
        {

            var writer = new BarcodeWriter();
            writer.Format = BarcodeFormat.QR_CODE;
            var result = writer.Write(string.Format("{0},{1},{2}", eventId, gliId, guestId));

            MemoryStream ms = new MemoryStream();
            result.Save(ms, ImageFormat.Jpeg);

            var qrStream = ms;

            var container = BlobHelper.GetWebApiContainer("qrcodes");

            var blob = container.GetBlockBlobReference(guestId.ToString() + "_" + DateTime.Now.Millisecond + "_" + "qr.jpeg");

            //blob.UploadFromStream(qrStream);
            blob.UploadFromByteArray(ms.ToArray(), 0, ms.ToArray().Length);

            return blob.Uri.AbsoluteUri;
        }

        public static void SendWelcomeEmail(string to, string website, string userName, string accountLink)
        {
            // Create the email object first, then add the properties.
            SendGridMessage myMessage = new SendGridMessage();
            myMessage.AddTo(to);
            myMessage.From = new MailAddress("admin@gjests.com", "gjests");

            myMessage.Subject = "Welcome to gjests";

            myMessage.Html = "<p></p> ";

            myMessage.EnableTemplateEngine("9389ac57-259a-418c-9e4f-1e478c380a23");


            myMessage.AddSubstitution(":website", new List<string> { website });
            myMessage.AddSubstitution(":login", new List<string> { userName });
            myMessage.AddSubstitution(":account_settings", new List<string> { accountLink });


            // Create credentials, specifying your user name and password.
            var credentials = new NetworkCredential("gliist", "gliist79*");

            // Create an Web transport for sending email.
            var transportWeb = new Web(credentials);

            // Send the email.
            // You can also use the **DeliverAsync** method, which returns an awaitable task.
            transportWeb.Deliver(myMessage);
        }



        public static void SendInvite(UserModel from, Event @event, Guest guest, GuestListInstance gli)
        {
            var qr_url = UploadQRCode(@event.id, guest.id, gli.id);


            // Create the email object first, then add the properties.
            SendGridMessage myMessage = new SendGridMessage();
            myMessage.AddTo(guest.email);
            myMessage.From = new MailAddress(from.UserName, from.company.name);

            myMessage.Subject = string.Format("{0} - Invitation", @event.title);

            myMessage.Html = "<p></p> ";

            myMessage.EnableTemplateEngine("70408aab-282a-41a4-a74a-0c207267d5c9");

            var logo = "";
            if (!string.IsNullOrEmpty(from.company.logo))
            {
                logo = from.company.logo;
            }


            var guestType = string.IsNullOrEmpty(guest.type) ? gli.listType : guest.type;

            myMessage.AddSubstitution(":guest_name", new List<string> { string.Format("{0} {1}", guest.firstName, guest.lastName) });

            myMessage.AddSubstitution(":guest_plus", new List<string> { guest.plus.ToString() });

            myMessage.AddSubstitution(":guest_type", new List<string> { guestType });
            myMessage.AddSubstitution(":company_logo", new List<string> { logo });

            myMessage.AddSubstitution(":event_invite", new List<string> { @event.invitePicture });
            myMessage.AddSubstitution(":event_name", new List<string> { @event.title });
            myMessage.AddSubstitution(":event_date", new List<string> { @event.time.Date.ToShortDateString() });

            myMessage.AddSubstitution(":event_time", new List<string> { @event.time.LocalDateTime.ToLocalTime().ToString("hh:mm tt") });

            myMessage.AddSubstitution(":event_location", new List<string> { string.IsNullOrEmpty(@event.location) ? "" : @event.location });
            myMessage.AddSubstitution(":qr_code_url", new List<string> { qr_url });


            // Create credentials, specifying your user name and password.
            var credentials = new NetworkCredential("gliist", "gliist79*");

            // Create an Web transport for sending email.
            var transportWeb = new Web(credentials);

            // Send the email.
            // You can also use the **DeliverAsync** method, which returns an awaitable task.
            transportWeb.Deliver(myMessage);
        }


        public static void SendJoinRequest(UserModel to, UserModel from, Invite invite)
        {
            // Create the email object first, then add the properties.
            SendGridMessage myMessage = new SendGridMessage();
            myMessage.AddTo(to.UserName);
            myMessage.From = new MailAddress("dontreplay@gjests.com", "gjests");

            myMessage.Subject = string.Format("Contributor Invitation from {0} {1}", from.firstName, from.lastName);

            myMessage.Html = "<p></p>";

            myMessage.EnableTemplateEngine("105b490c-8585-4e17-b5e6-ee502c1fac85");

            myMessage.AddSubstitution(":to_first_name", new List<string> { invite.firstName });

            myMessage.AddSubstitution(":company_name", new List<string> { from.company.name });

            myMessage.AddSubstitution(":permissions", new List<string> { to.permissions });


            myMessage.AddSubstitution(":full_name_from", new List<string> { from.firstName, from.lastName });

            myMessage.AddSubstitution(":website", new List<string> { from.company.name });
            myMessage.AddSubstitution(":login", new List<string> { to.UserName });
            myMessage.AddSubstitution(":account_settings",
                new List<string>
                { 
                string.Format("http://gliist.azurewebsites.net/dist/#/signup/invite/{0}/{1}",from.company.name ,invite.token) 
                }
            );


            // Create credentials, specifying your user name and password.
            var credentials = new NetworkCredential("gliist", "gliist79*");

            // Create an Web transport for sending email.
            var transportWeb = new Web(credentials);

            // Send the email.
            // You can also use the **DeliverAsync** method, which returns an awaitable task.
            transportWeb.Deliver(myMessage);
        }


    }
}