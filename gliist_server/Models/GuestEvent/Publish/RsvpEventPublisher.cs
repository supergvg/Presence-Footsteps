using System;
using System.Linq;
using gliist_server.DataAccess;
using SendGrid;

namespace gliist_server.Models
{
    class RsvpEventPublisher : PrivateEventPublisher
    {
        public RsvpEventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user, Event @event)
            : base(dbContext, publishDetails, user, @event)
        {
        }

        protected override bool ListShouldBePublished(GuestListInstance listInstance)
        {
            bool shouldBePublished = base.ListShouldBePublished(listInstance) ||
                   listInstance.InstanceType == GuestListInstanceType.Rsvp ||
                   listInstance.InstanceType == GuestListInstanceType.PublicRsvp;

            if (!shouldBePublished)
                return false;

            var guests = DataService.GetGuestsByList(listInstance.id);
            shouldBePublished = guests.All(x => IsValidEmail(x.Guest.email));
            
            return shouldBePublished;
        }

        protected override bool GuestAlreadyNotificated(EventGuestStatus guest,
            GuestListInstance listInstance)
        {
            return base.GuestAlreadyNotificated(guest, listInstance) ||
                   (listInstance.InstanceType == GuestListInstanceType.Rsvp && guest.IsRsvpEmailSent) ||
                   listInstance.InstanceType == GuestListInstanceType.PublicRsvp;
        }

        protected override ISendGrid PrepareSpecificMessageToGuest(EventGuestStatus guest,
            GuestListInstance listInstance)
        {
            return (IsListPrivate(listInstance))
                ? base.PrepareSpecificMessageToGuest(guest, listInstance)
                : PrepareRsvpMessage(guest, listInstance);
        }

        protected override void MarkGuestAsNotificated(EventGuestStatus guest,
            GuestListInstance listInstance)
        {
            if (IsListPrivate(listInstance))
            {
                base.MarkGuestAsNotificated(guest, listInstance);
                return;
            }

            guest.RsvpEmailSentDate = DateTime.Now;
        }

        #region private

        private static bool IsListPrivate(GuestListInstance listInstance)
        {
            return listInstance.InstanceType == GuestListInstanceType.Default ||
                   listInstance.InstanceType == GuestListInstanceType.Confirmed;
        }

        private ISendGrid PrepareRsvpMessage(EventGuestStatus guest, GuestListInstance listInstance)
        {
            var messageBuilder = new SendGridMessageBuilder(new SendGridHeader
            {
                Subject = string.Format("{0} - Please RSVP for this Event", DataService.Event.title),
                From = DataService.Administrator.company.name,
                To = guest.Guest.email
            });

            var substitutionBuilder = new SendGridSubstitutionsBuilder();
            substitutionBuilder.CreateGuestName(guest.Guest);
            substitutionBuilder.CreateEventDetails(DataService.Event, listInstance);
            substitutionBuilder.CreateOrganizer(DataService.Administrator);
            substitutionBuilder.CreateLogoAndEventImage(DataService.Administrator, DataService.Event);
            substitutionBuilder.CreateRsvpUrl(DataService.Event, guest.Guest, Config.AppBaseUrl);

            messageBuilder.ApplySubstitutions(substitutionBuilder.Result);

            messageBuilder.ApplyTemplate(GetTemplate());
            messageBuilder.SetCategories(new[] { "Event RSVP", DataService.Administrator.company.name, DataService.Event.title });

            return messageBuilder.Result;
        }

        private string GetTemplate()
        {
            var settings = DataService.GetCompanySettings().FirstOrDefault(x => x.Key == "RsvpEmailTemplateId");

            return (settings != null)
                ? settings.Value
                : SendGridTemplateIds.EventRsvpGuestInvitation;
        }

        #endregion
    }
}