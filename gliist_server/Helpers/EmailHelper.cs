using gliist_server.Models;
using SendGrid;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Web;
using gliist_server.Shared;
using ZXing;

namespace gliist_server.Helpers
{
    public static class EmailHelper
    {
        // http://www.dotnetthoughts.net/how-to-generate-and-read-qr-code-in-asp-net/
        //to store images http://azure.microsoft.com/en-us/documentation/articles/cdn-serve-content-from-cdn-in-your-web-application/
        // QR http://www.dotnetthoughts.net/how-to-generate-and-read-qr-code-in-asp-net/

        //http://azure.microsoft.com/en-us/documentation/articles/storage-dotnet-how-to-use-blobs/ blob


        private static readonly string appBaseUrl = ConfigurationManager.AppSettings["appBaseUrl"];
        private static readonly string sendgridUsername = "gliist";
        private static readonly string sendgridPassword = "gliist925$";
        private static readonly string inviteEmailSendgridTemplateId = "033338d5-941a-4906-9110-ba02c59dccef";
        private static readonly string inviteUserAccountEmailSendgridTemplateId = "105b490c-8585-4e17-b5e6-ee502c1fac85";
        private static readonly string rsvpEmailSendgridTemplateId = "50023ddc-4065-4940-bf46-4c1b340c3411";
        private static readonly string ticketingEmailSendgridTemplateId = "b5660521-f997-4a03-8cd1-821588cfb0bb";

        private static string UploadQRCode(int eventId, int guestId, int gliId)
        {

            var writer = new BarcodeWriter();
            writer.Format = BarcodeFormat.QR_CODE;
            writer.Options.Margin = 0;
            writer.Options.Width = 200;
            writer.Options.Height = 200;

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
            var credentials = new NetworkCredential(sendgridUsername, sendgridPassword);

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
            var credentials = new NetworkCredential(sendgridUsername, sendgridPassword);

            // Create an Web transport for sending email.
            var transportWeb = new Web(credentials);

            // Send the email.
            // You can also use the **DeliverAsync** method, which returns an awaitable task.
            transportWeb.Deliver(myMessage);
        }



        public static void SendInvite(UserModel from, Event @event, Guest guest, GuestListInstance gli, string baseUrl, Dictionary<string, string> additionalSubstitutions)
        {
            string subject = string.Format("{0} - Invitation", @event.title);
            var substitutions = PrepareSubstitutionsList(from, @event, guest, gli);

            foreach (var key in additionalSubstitutions.Keys)
            {
                substitutions.Add(key, additionalSubstitutions[key]);
            }


            var categories = new List<string> { "Event Invitation", from.company.name, @event.title};

            var email = BuildEmailFromSendGridTemplate(from.company.name, guest.email, inviteEmailSendgridTemplateId, subject, substitutions, categories);
            SendEmail(email);
        }


        public static void SendJoinRequest(UserModel to, UserModel from, Invite invite, HttpRequestMessage request)
        {
            // Create the email object first, then add the properties.
            SendGridMessage myMessage = new SendGridMessage();
            myMessage.AddTo(to.UserName);

            myMessage.SetCategories(new List<string> { "Contributor Invitation", from.company.name });


            myMessage.From = new MailAddress("dontreplay@gjests.com", "gjests");

            myMessage.Subject = string.Format("Contributor Invitation from {0} {1}", from.firstName, from.lastName);

            myMessage.Html = "<p></p>";

            myMessage.EnableTemplateEngine(inviteUserAccountEmailSendgridTemplateId);

            myMessage.AddSubstitution(":to_first_name", new List<string> { invite.firstName });

            myMessage.AddSubstitution(":company_name", new List<string> { from.company.name });

            myMessage.AddSubstitution(":permissions", new List<string> { to.permissions });


            myMessage.AddSubstitution(":full_name_from", new List<string> { from.firstName, from.lastName });

            myMessage.AddSubstitution(":website", new List<string> { from.company.name });
            myMessage.AddSubstitution(":login", new List<string> { to.UserName });
            myMessage.AddSubstitution(":account_settings",
                new List<string>
                { 
                    string.Format("{0}/#/signup/invite/{1}/{2}", appBaseUrl , from.company.name ,invite.token)
                }
            );


            // Create credentials, specifying your user name and password.
            var credentials = new NetworkCredential(sendgridUsername, sendgridPassword);

            // Create an Web transport for sending email.
            var transportWeb = new Web(credentials);

            // Send the email.
            // You can also use the **DeliverAsync** method, which returns an awaitable task.
            transportWeb.Deliver(myMessage);
        }

        public static void SendRsvp(UserModel from, Event @event, Guest guest, GuestListInstance gli, Dictionary<string, string> additionalSubstitutions)
        {
            string subject = string.Format("{0} - Please RSVP for this Event", @event.title);

            var landingPageUrlGenerator = new GjestsLinksGenerator(appBaseUrl);
            string landingPageUrl = (@event.RsvpType == RsvpType.InvitedGuests) ?
                landingPageUrlGenerator.GenerateGuestRsvpLandingPageLink(@event.id, guest.id)
                : @event.RsvpUrl;

            var substitutions = PrepareSubstitutionsList(from, @event, guest, gli);
            substitutions.Add(":event_rsvpUrl", landingPageUrl ?? string.Empty);

            substitutions[":event_details"] = (!string.IsNullOrEmpty(@event.AdditionalDetails))
                ? @event.AdditionalDetails
                : @event.description;

            foreach (var key in additionalSubstitutions.Keys)
            {
                substitutions.Add(key, additionalSubstitutions[key]);
            }

            var categories = new List<string> { "Event RSVP", from.company.name, @event.title };


            var email = BuildEmailFromSendGridTemplate(from.company.name, guest.email, rsvpEmailSendgridTemplateId, subject, substitutions, categories);

            SendEmail(email);
        }

        public static void SendTicketing(UserModel from, Event @event, Guest guest, GuestListInstance gli, Dictionary<string, string> additionalSubstitutions)
        {
            string subject = string.Format("{0} - Tickets", @event.title);

            var landingPageUrlGenerator = new GjestsLinksGenerator(appBaseUrl);
            string landingPageUrl = landingPageUrlGenerator.GenerateGuestTicketsLandingPageLink(@event.id, guest.id);

            var substitutions = PrepareSubstitutionsList(from, @event, guest, gli);
            substitutions.Add(":event_ticketingUrl", landingPageUrl ?? string.Empty);

            substitutions[":event_details"] = (!string.IsNullOrEmpty(@event.AdditionalDetails))
                ? @event.AdditionalDetails
                : @event.description;

            foreach (var key in additionalSubstitutions.Keys)
            {
                substitutions.Add(key, additionalSubstitutions[key]);
            }

            var categories = new List<string> { "Ticket", from.company.name, @event.title };

            var email = BuildEmailFromSendGridTemplate(from.company.name, guest.email, ticketingEmailSendgridTemplateId, subject, substitutions, categories);
            SendEmail(email);
        }

        private static void SendEmail(SendGridMessage email)
        {
            var credentials = new NetworkCredential(sendgridUsername, sendgridPassword);
            var transportWeb = new Web(credentials);
            transportWeb.Deliver(email);
        }

        private static Dictionary<string, string> PrepareSubstitutionsList(UserModel from, Event @event, Guest guest, GuestListInstance gli)
        {
            var qr_url = UploadQRCode(@event.id, guest.id, gli.id);
            var logo = ImageHelper.GetLogoImageUrl(from.company.logo, from.profilePictureUrl);
            var guestType = string.IsNullOrEmpty(guest.type) ? gli.listType : guest.type;

            var substitutions = new Dictionary<string, string>();
            substitutions.Add(":guest_name", string.Format("{0} {1}", guest.firstName, guest.lastName));
            substitutions.Add(":guest_plus", guest.plus.ToString());
            substitutions.Add(":guest_type", guestType);
            substitutions.Add(":company_logo", logo);
            substitutions.Add(":event_invite", @event.invitePicture);
            substitutions.Add(":event_name", @event.title);
            substitutions.Add(":event_date", @event.time.Date.ToShortDateString());
            substitutions.Add(":comapny_facebookUrl", @from.company.FacebookPageUrl ?? string.Empty);
            substitutions.Add(":company_twitterUrl", @from.company.TwitterPageUrl ?? string.Empty);
            substitutions.Add(":company_instagrammUrl", @from.company.InstagrammPageUrl ?? string.Empty);
            substitutions.Add(":event_details", @event.description ?? string.Empty);
            substitutions.Add(":event_time", @event.time.ToString("hh:mm tt"));
            substitutions.Add(":event_location", string.IsNullOrEmpty(@event.location) ? "" : @event.location);
            substitutions.Add(":qr_code_url", qr_url);
            return substitutions;
        }

        private static SendGridMessage BuildEmailFromSendGridTemplate(string fromComapnyName, string guestEmail, string templateId, string subject,
            Dictionary<string, string> substitutions, List<string> categories)
        {
            SendGridMessage email = new SendGridMessage();
            email.AddTo(guestEmail);
            email.From = new MailAddress("non-reply@gjests.com", fromComapnyName);
            email.Subject = subject;
            email.Html = "<p></p>";

            email.SetCategories(categories);

            if (!string.IsNullOrEmpty(templateId))
            {
                email.EnableTemplateEngine(templateId);
            }

            foreach (var key in substitutions.Keys)
            {
                email.AddSubstitution(key, new List<string> { substitutions[key] ?? string.Empty });
            }

            email.EnableOpenTracking();
            email.EnableClickTracking();
            return email;
        }
    }
}