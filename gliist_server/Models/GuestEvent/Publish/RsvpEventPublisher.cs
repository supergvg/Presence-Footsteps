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
            return IsListPrivate(listInstance) ||
                listInstance.InstanceType == GuestListInstanceType.Rsvp;
        }

        protected override bool GuestAlreadyNotificated(EventGuestStatus guest,
            GuestListInstance listInstance)
        {
            return (listInstance.InstanceType == GuestListInstanceType.Rsvp && guest.IsRsvpEmailSent) ||
                   (IsListPrivate(listInstance) && guest.IsInvitationEmailSent);
        }

        protected override ISendGrid PrepareSpecificMessageToGuest(EventGuestStatus guest,
            GuestListInstance listInstance)
        {
            return (IsListPrivate(listInstance)) 
                ? PreparePrivateMessage(guest, listInstance)
                : PrepareRsvpMessage(guest);
        }

        protected override void MarkGuestAsNotificated(EventGuestStatus guest)
        {
            guest.RsvpEmailSentDate = DateTime.UtcNow;
        }

        #region private

        private static bool IsListPrivate(GuestListInstance listInstance)
        {
            return listInstance.InstanceType == GuestListInstanceType.Default ||
                   listInstance.InstanceType == GuestListInstanceType.Confirmed;
        }

        private ISendGrid PreparePrivateMessage(EventGuestStatus guest, GuestListInstance listInstance)
        {
            var messageBuilder = new SendGridMessageBuilder(new SendGridHeader
            {
                Subject = string.Format("{0} - Invitation", Event.title),
                From = Administrator.company.name,
                To = guest.Guest.email
            });

            var substitutionBuilder = new SendGridSubstitutionsBuilder();
            substitutionBuilder.CreateGuestName(guest.Guest);
            substitutionBuilder.CreateGuestDetails(guest.AdditionalGuestsRequested, guest.Guest, listInstance);
            substitutionBuilder.CreateEventDetails(Event, Event.description);
            substitutionBuilder.CreateOrganizer(Administrator);
            substitutionBuilder.CreateSocialLinks(Administrator);
            substitutionBuilder.CreateLogoAndEventImage(Administrator, Event);
            substitutionBuilder.CreateQrCode(Event.id, listInstance.id, guest.GuestId);

            messageBuilder.ApplySubstitutions(substitutionBuilder.Result);

            messageBuilder.ApplyTemplate(SendGridTemplateIds.EventPrivateGuestConfirmation);
            messageBuilder.SetCategories(new[] { "Event Invitation", Administrator.company.name, Event.title });

            return messageBuilder.Result;
        }

        private ISendGrid PrepareRsvpMessage(EventGuestStatus guest)
        {
            var messageBuilder = new SendGridMessageBuilder(new SendGridHeader
            {
                Subject = string.Format("{0} - Please RSVP for this Event", Event.title),
                From = Administrator.company.name,
                To = guest.Guest.email
            });

            var substitutionBuilder = new SendGridSubstitutionsBuilder();
            substitutionBuilder.CreateGuestName(guest.Guest);
            substitutionBuilder.CreateEventDetails(Event, Event.AdditionalDetails);
            substitutionBuilder.CreateOrganizer(Administrator);
            substitutionBuilder.CreateLogoAndEventImage(Administrator, Event);
            substitutionBuilder.CreateRsvpUrl(Event, guest.Guest, Config.AppBaseUrl);

            messageBuilder.ApplySubstitutions(substitutionBuilder.Result);

            messageBuilder.ApplyTemplate(SendGridTemplateIds.EventPrivateGuestConfirmation);
            messageBuilder.SetCategories(new[] { "Event RSVP", Administrator.company.name, Event.title });

            return messageBuilder.Result;
        }

        #endregion
    }
}