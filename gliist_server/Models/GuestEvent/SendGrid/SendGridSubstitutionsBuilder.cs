using System.Collections.Generic;

namespace gliist_server.Models
{
    public class SendGridSubstitutionsBuilder
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

        public void CreateGuestDetails(EventGuestStatus guestStatus, GuestListInstance listInstance)
        {
            if (!Result.ContainsKey(":guest_plus"))
                Result.Add(":guest_plus", guestStatus.AdditionalGuestsRequested.ToString());

            var guestType = string.IsNullOrEmpty(guestStatus.Guest.type)
                ? listInstance.listType
                : guestStatus.Guest.type;

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

        public void CreateRsvpUrl()
        {

        }
    }
}