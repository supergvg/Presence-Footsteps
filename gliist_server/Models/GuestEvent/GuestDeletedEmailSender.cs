using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using SendGrid;

namespace gliist_server.Models.GuestEvent
{
    static class GuestDeletedEmailSender
    {
        private const string TemplateId = "35f627f9-9503-42a9-b736-a28fc53703f9";

        public static void Run(UserModel user, EventGuestStatus eventGuest)
        {
            var message = CreateMessage();

            SetHeaderAndBody(message);
            SetSubstitutions(user, eventGuest, message);
            SetCategories(message);

            SendMessage(message);
        }

        private static void SendMessage(ISendGrid message)
        {
            var credentials = new NetworkCredential("gliist", "gliist925$");
            var transportWeb = new Web(credentials);
            transportWeb.Deliver(message);
        }

        private static SendGridMessage CreateMessage()
        {
            var message = new SendGridMessage();
            
            message.EnableTemplateEngine(TemplateId);
            message.EnableOpenTracking();
            message.EnableClickTracking();

            return message;
        }

        private static void SetHeaderAndBody(ISendGrid message)
        {
            message.From = new MailAddress("dont-replay@gjests.com", "gjests");
            message.Subject = string.Format("Event is at capacity.");
            message.Html = "<p></p>";
        }

        private static void SetCategories(ISendGrid message)
        {
            message.SetCategories(new List<string> { "Guest deleted" });
        }

        private static void SetSubstitutions(UserModel user, EventGuestStatus eventGuest, ISendGrid message)
        {
            message.AddSubstitution(":company_logo", new List<string> {user.profilePictureUrl});
            message.AddSubstitution(":event_name", new List<string> { eventGuest.Event.title });

            message.AddSubstitution(":event_date", new List<string> { eventGuest.Event.time.Date.ToShortDateString() });
            message.AddSubstitution(":event_time", new List<string> { eventGuest.Event.time.ToString("hh:mm tt") });

            message.AddSubstitution(":event_location", new List<string> {eventGuest.Event.location ?? string.Empty});
            message.AddSubstitution(":organizer_email", new List<string> { user.UserName ?? string.Empty });
            message.AddSubstitution(":event_details", new List<string> { GetEventDetails(eventGuest)});

            message.AddSubstitution(":company_facebookUrl", new List<string> { user.company.FacebookPageUrl ?? string.Empty });
            message.AddSubstitution(":company_twitterUrl", new List<string> { user.company.TwitterPageUrl ?? string.Empty });
            message.AddSubstitution(":company_instagrammUrl", new List<string> { user.company.InstagrammPageUrl ?? string.Empty });

            message.AddSubstitution(":event_details", new List<string> { eventGuest.Event.description ?? string.Empty });
        }

        private static string GetEventDetails(EventGuestStatus eventGuest)
        {
            return ((eventGuest.GuestListInstanceType == GuestListInstanceType.Default ||
                     eventGuest.GuestListInstanceType == GuestListInstanceType.Confirmed)
                ? eventGuest.Event.description
                : eventGuest.Event.AdditionalDetails) ?? string.Empty;
        }
    }
}