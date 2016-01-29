using System;
using SendGrid;

namespace gliist_server.Models
{
    class RsvpEventPublisher : EventPublisher
    {
        public RsvpEventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user, Event @event)
            : base(dbContext, publishDetails, user, @event)
        {
        }

        protected override bool ListShouldBePublished(GuestListInstance listInstance)
        {
            return listInstance.InstanceType == GuestListInstanceType.Rsvp;
        }

        protected override bool GuestAlreadyNotificated(EventGuestStatus guest)
        {
            return guest.IsRsvpEmailSent;
        }

        protected override ISendGrid PrepareSpecificMessageToGuest(EventGuestStatus guest,
            GuestListInstance listInstance)
        {
            var messageBuilder = new SendGridMessageBuilder(new SendGridHeader
            {
                Subject = string.Format("{0} - Please RSVP for this Event", Event.title),
                From = Administrator.company.name,
                To = guest.Guest.email
            });

            var substitutionBuilder = new SendGridSubstitutionsBuilder();
            substitutionBuilder.CreateGuestName(guest.Guest);
            substitutionBuilder.CreateEventDetails(Event);
            substitutionBuilder.CreateOrganizer(Administrator);
            substitutionBuilder.CreateLogoAndEventImage(Administrator, Event);
            substitutionBuilder.CreateRsvpUrl(Event, guest.Guest, Config.AppBaseUrl);

            messageBuilder.ApplySubstitutions(substitutionBuilder.Result);

            messageBuilder.ApplyTemplate(SendGridTemplateIds.EventPrivateGuestConfirmation);
            messageBuilder.SetCategories(new[] {"Event RSVP", Administrator.company.name, Event.title});

            return messageBuilder.Result;
        }

        protected override void MarkGuestAsNotificated(EventGuestStatus guest)
        {
            guest.RsvpEmailSentDate = DateTime.UtcNow;
        }
    }
}