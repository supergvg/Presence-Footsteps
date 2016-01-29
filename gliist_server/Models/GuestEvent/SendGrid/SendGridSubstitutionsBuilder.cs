using System;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.IO;
using gliist_server.Helpers;
using gliist_server.Shared;
using ZXing;

namespace gliist_server.Models
{
    class SendGridSubstitutionsBuilder
    {
        public Dictionary<string, string> Result { get; private set; }

        public SendGridSubstitutionsBuilder()
        {
            Result = new Dictionary<string, string>();
        }

        public void CreateGuestName(Guest guest)
        {
            if (!Result.ContainsKey(":guest_name"))
                Result.Add(":guest_name", string.Format("{0} {1}", guest.firstName, guest.lastName));
        }

        public void CreateGuestDetails(int plus, Guest guest, GuestListInstance listInstance)
        {
            if (!Result.ContainsKey(":guest_plus"))
                Result.Add(":guest_plus", plus.ToString());

            var guestType = string.IsNullOrEmpty(guest.type)
                ? listInstance.listType
                : guest.type;

            if (!Result.ContainsKey(":guest_type"))
                Result.Add(":guest_type", guestType);
        }

        public void CreateEventDetails(Event @event)
        {
            if (!Result.ContainsKey(":event_name"))
                Result.Add(":event_name", @event.title);

            if (!Result.ContainsKey(":event_date"))
                Result.Add(":event_date", @event.time.Date.ToShortDateString());

            if (!Result.ContainsKey(":event_time"))
                Result.Add(":event_time", @event.time.ToString("hh:mm tt"));

            if (!Result.ContainsKey(":event_location"))
                Result.Add(":event_location", @event.location ?? string.Empty);

            if (!Result.ContainsKey(":event_details"))
                Result.Add(":event_details", @event.description ?? string.Empty);
        }

        public void CreateLogoAndEventImage(UserModel user, Event @event)
        {
            if (!Result.ContainsKey(":company_logo"))
                Result.Add(":company_logo", user.profilePictureUrl);

            if (!Result.ContainsKey(":event_invite"))
                Result.Add(":event_invite", @event.invitePicture);
        }

        public void CreateOrganizer(UserModel user)
        {
            if (!Result.ContainsKey(":organizer_email"))
                Result.Add(":organizer_email", user.UserName);
        }

        public void CreateSocialLinks(UserModel user)
        {
            if (!Result.ContainsKey(":comapny_facebookUrl"))
                Result.Add(":comapny_facebookUrl", user.company.FacebookPageUrl ?? string.Empty);

            if (!Result.ContainsKey(":company_twitterUrl"))
                Result.Add(":company_twitterUrl", user.company.TwitterPageUrl ?? string.Empty);

            if (!Result.ContainsKey(":company_instagrammUrl"))
                Result.Add(":company_instagrammUrl", user.company.InstagrammPageUrl ?? string.Empty);
        }

        public void CreateRsvpUrl(Event @event, Guest guest, string baseUrl)
        {
            if(Result.ContainsKey(":event_rsvpUrl"))
                return;
            
            var landingPageUrlGenerator = new GjestsLinksGenerator(baseUrl);
            var landingPageUrl = landingPageUrlGenerator.GenerateGuestRsvpLandingPageLink(@event.id, guest.id);

            Result.Add(":event_rsvpUrl", landingPageUrl ?? string.Empty);
        }

        public void CreateQrCode(int eventId, int listId, int guestId)
        {
            if (Result.ContainsKey(":qr_code_url"))
                return;

            var writer = new BarcodeWriter
            {
                Format = BarcodeFormat.QR_CODE,
                Options = { Margin = 0, Width = 200, Height = 200 }
            };

            var result = writer.Write(string.Format("{0},{1},{2}", eventId, listId, guestId));

            var ms = new MemoryStream();
            result.Save(ms, ImageFormat.Jpeg);

            var container = BlobHelper.GetWebApiContainer("qrcodes");

            var blob = container.GetBlockBlobReference(guestId + "_" + DateTime.Now.Millisecond + "_" + "qr.jpeg");

            blob.UploadFromByteArray(ms.ToArray(), 0, ms.ToArray().Length);

            Result.Add(":qr_code_url", blob.Uri.AbsoluteUri);
        }
    }
}