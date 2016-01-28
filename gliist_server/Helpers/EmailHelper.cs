using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using gliist_server.Models;
using gliist_server.Shared;
using SendGrid;
using ZXing;

namespace gliist_server.Helpers
{
    public static class EmailHelper
    {
        // http://www.dotnetthoughts.net/how-to-generate-and-read-qr-code-in-asp-net/
        //to store images http://azure.microsoft.com/en-us/documentation/articles/cdn-serve-content-from-cdn-in-your-web-application/
        // QR http://www.dotnetthoughts.net/how-to-generate-and-read-qr-code-in-asp-net/

        //http://azure.microsoft.com/en-us/documentation/articles/storage-dotnet-how-to-use-blobs/ blob


        private static readonly string AppBaseUrl = ConfigurationManager.AppSettings["appBaseUrl"];
        private const string SendgridUsername = "gliist";
        private const string SendgridPassword = "gliist925$";
        
        private const string InviteUserAccountEmailSendgridTemplateId = "105b490c-8585-4e17-b5e6-ee502c1fac85";

        private const string EventPrivateGuestConfirmationId = "033338d5-941a-4906-9110-ba02c59dccef";
        private const string EventPrivateEventDetailsUpdatingId = "7e33176d-e6b2-49a6-ab6b-879a790fb8a4";
        private const string EventRsvpGuestInvitationId = "50023ddc-4065-4940-bf46-4c1b340c3411";
        private const string EventTicketingGuestInvitationId = "b5660521-f997-4a03-8cd1-821588cfb0bb";
        private const string EventTicketingPurchasedTicketId = "2e017045-d764-40ae-b969-00556d7bfbb0";

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

            myMessage.EnableTemplateEngine(InviteUserAccountEmailSendgridTemplateId);

            myMessage.AddSubstitution(":to_first_name", new List<string> { invite.firstName });

            myMessage.AddSubstitution(":company_name", new List<string> { @from.company.name });

            myMessage.AddSubstitution(":permissions", new List<string> { to.permissions });


            myMessage.AddSubstitution(":full_name_from", new List<string> { @from.firstName, @from.lastName });

            myMessage.AddSubstitution(":website", new List<string> { @from.company.name });
            myMessage.AddSubstitution(":login", new List<string> { to.UserName });
            myMessage.AddSubstitution(":account_settings",
                new List<string>
                { 
                    string.Format("{0}/#/signup/invite/{1}/{2}", AppBaseUrl , @from.company.name ,invite.token)
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

        #region event publish emails

        public static void SendInviteUpdated(UserModel from, Event @event, Guest guest, GuestListInstance gli, string baseUrl, Dictionary<string, string> additionalSubstitutions)
        {
            string subject = string.Format("{0} - Invitation. Event was updated", @event.title);
            SendInvite(from, @event, guest, gli, additionalSubstitutions, subject);
        }

        public static void SendInvite(UserModel from, Event @event, Guest guest, GuestListInstance gli, string baseUrl, Dictionary<string, string> additionalSubstitutions)
        {
            string subject = string.Format("{0} - Invitation", @event.title);
            SendInvite(from, @event, guest, gli, additionalSubstitutions, subject);
        }

        public static void SendRsvp(UserModel from, Event @event, Guest guest, GuestListInstance gli, Dictionary<string, string> additionalSubstitutions)
        {
            string subject = string.Format("{0} - Please RSVP for this Event", @event.title);

            var landingPageUrlGenerator = new GjestsLinksGenerator(AppBaseUrl);
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


            var email = BuildEmailFromSendGridTemplate(from.company.name, guest.email, EventRsvpGuestInvitationId, subject, substitutions, categories);

            SendEmail(email);
        }

        public static void SendTicketing(UserModel from, Event @event, Guest guest, GuestListInstance gli, Dictionary<string, string> additionalSubstitutions)
        {
            string subject = string.Format("{0} - Tickets", @event.title);

            var landingPageUrlGenerator = new GjestsLinksGenerator(AppBaseUrl);
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

            var email = BuildEmailFromSendGridTemplate(from.company.name, guest.email, EventTicketingGuestInvitationId, subject, substitutions, categories);
            SendEmail(email);
        }

        #endregion

        #region private methods

        private static string UploadQRCode(int eventId, int guestId, int gliId)
        {

            var writer = new BarcodeWriter
            {
                Format = BarcodeFormat.QR_CODE,
                Options = {Margin = 0, Width = 200, Height = 200}
            };

            var result = writer.Write(string.Format("{0},{1},{2}", eventId, gliId, guestId));

            var ms = new MemoryStream();
            result.Save(ms, ImageFormat.Jpeg);

            var container = BlobHelper.GetWebApiContainer("qrcodes");

            var blob = container.GetBlockBlobReference(guestId + "_" + DateTime.Now.Millisecond + "_" + "qr.jpeg");

            blob.UploadFromByteArray(ms.ToArray(), 0, ms.ToArray().Length);

            return blob.Uri.AbsoluteUri;
        }

        private static void SendInvite(UserModel from, Event @event, Guest guest, GuestListInstance gli,
            Dictionary<string, string> additionalSubstitutions, string subject)
        {
            var substitutions = PrepareSubstitutionsList(from, @event, guest, gli);

            foreach (var key in additionalSubstitutions.Keys)
            {
                substitutions.Add(key, additionalSubstitutions[key]);
            }


            var categories = new List<string> {"Event Invitation", from.company.name, @event.title};

            var email = BuildEmailFromSendGridTemplate(from.company.name, guest.email, EventPrivateGuestConfirmationId,
                subject, substitutions, categories);
            SendEmail(email);
        }

        private static void SendEmail(ISendGrid email)
        {
            var credentials = new NetworkCredential(SendgridUsername, SendgridPassword);
            var transportWeb = new Web(credentials);
            transportWeb.Deliver(email);
        }

        private static Dictionary<string, string> PrepareSubstitutionsList(UserModel from, Event @event, Guest guest,
            GuestListInstance gli)
        {
            var qrURL = UploadQRCode(@event.id, guest.id, gli.id);
            var logo = ImageHelper.GetLogoImageUrl(from.company.logo, from.profilePictureUrl);
            var guestType = string.IsNullOrEmpty(guest.type) ? gli.listType : guest.type;
            var organizer = @event.company != null && @event.company.users != null
                ? @event.company.users.FirstOrDefault()
                : null;
            var organizerEmail = organizer != null ? organizer.UserName : "";

            var substitutions = new Dictionary<string, string>
            {
                {":guest_name", string.Format("{0} {1}", guest.firstName, guest.lastName)},
                {":guest_plus", guest.plus.ToString()},
                {":guest_type", guestType},

                {":company_logo", logo},
                {":event_invite", @event.invitePicture},
                {":event_name", @event.title},
                {":event_date", @event.time.Date.ToShortDateString()},
                {":comapny_facebookUrl", @from.company.FacebookPageUrl ?? string.Empty},
                {":company_twitterUrl", @from.company.TwitterPageUrl ?? string.Empty},
                {":company_instagrammUrl", @from.company.InstagrammPageUrl ?? string.Empty},
                {":event_details", @event.description ?? string.Empty},
                {":event_time", @event.time.ToString("hh:mm tt")},
                {":event_location", string.IsNullOrEmpty(@event.location) ? "" : @event.location},
                {":qr_code_url", qrURL},
                {":organizer_email", organizerEmail}
            };

            AddImagesSubstitutionsIfNeeded(substitutions, @event, from);

            return substitutions;
        }

        private static void AddImagesSubstitutionsIfNeeded(Dictionary<string, string> substitutions, Event @event,
            UserModel user)
        {
            var eventImageDimensions = ImageHelper.GetImageSizeByUrl(@event.invitePicture);
            eventImageDimensions = ImageHelper.GetScaledDimensions(eventImageDimensions,
                ImageHelper.EventEmailImageMaxWidth,
                ImageHelper.EventEmailImageMaxHeight);

            if (eventImageDimensions != null)
            {
                substitutions.Add(":event_image_width", eventImageDimensions.Width.ToString());
                substitutions.Add(":event_image_height", eventImageDimensions.Height.ToString());
            }
            var logoImageDimensions =
                ImageHelper.GetImageSizeByUrl(ImageHelper.GetLogoImageUrl(@event.company.logo, user.profilePictureUrl));
            logoImageDimensions = ImageHelper.GetScaledDimensions(logoImageDimensions,
                ImageHelper.LogoEmailImageMaxWidth,
                ImageHelper.LogoEmailImageMaxHeight);

            if (logoImageDimensions != null)
            {
                substitutions.Add(":logo_image_width", logoImageDimensions.Width.ToString());
                substitutions.Add(":logo_image_height", logoImageDimensions.Height.ToString());
            }
        }

        private static SendGridMessage BuildEmailFromSendGridTemplate(string fromComapnyName, string guestEmail,
            string templateId, string subject,
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
                email.AddSubstitution(key, new List<string> {substitutions[key] ?? string.Empty});
            }

            email.EnableOpenTracking();
            email.EnableClickTracking();
            return email;
        }

        #endregion

    }
}