using System;
using gliist_server.DataAccess;
using SendGrid;

namespace gliist_server.Models
{
    class TicketingEventPublisher : EventPublisher
    {
        public TicketingEventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user, Event @event) 
            : base(dbContext, publishDetails, user, @event)
        {
        }

        protected override bool ListShouldBePublished(GuestListInstance listInstance)
        {
            return listInstance.InstanceType == GuestListInstanceType.Default ||
                   listInstance.InstanceType == GuestListInstanceType.Confirmed ||
                   listInstance.InstanceType == GuestListInstanceType.Rsvp ||
                   listInstance.InstanceType == GuestListInstanceType.PublicRsvp;
        }

        protected override bool GuestAlreadyNotificated(EventGuestStatus guest,
            GuestListInstance listInstance)
        {
            return ((listInstance.InstanceType == GuestListInstanceType.Default ||
                     listInstance.InstanceType == GuestListInstanceType.Confirmed ||
                     listInstance.InstanceType == GuestListInstanceType.Rsvp) && guest.IsRsvpEmailSent) ||
                   listInstance.InstanceType == GuestListInstanceType.PublicRsvp;
        }

        protected override ISendGrid PrepareSpecificMessageToGuest(EventGuestStatus guest, GuestListInstance listInstance)
        {
            var messageBuilder = new SendGridMessageBuilder(new SendGridHeader
            {
                Subject = string.Format("{0} - Invitation", Event.title),
                From = Administrator.company.name,
                To = guest.Guest.email
            });

            var substitutionBuilder = new SendGridSubstitutionsBuilder();
            substitutionBuilder.CreateGuestName(guest.Guest);
            substitutionBuilder.CreateEventDetails(Event, listInstance);
            substitutionBuilder.CreateOrganizer(Administrator);
            substitutionBuilder.CreateSocialLinks(Administrator);
            substitutionBuilder.CreateLogoAndEventImage(Administrator, Event);
            substitutionBuilder.CreateBuyTicketUrl(Event, guest.Guest, Config.AppBaseUrl);

            messageBuilder.ApplySubstitutions(substitutionBuilder.Result);

            messageBuilder.ApplyTemplate(SendGridTemplateIds.EventTicketingGuestInvitation);
            messageBuilder.SetCategories(new[] { "Event RSVP", "Ticketing", Administrator.company.name, Event.title });

            return messageBuilder.Result;
        }

        protected override void MarkGuestAsNotificated(EventGuestStatus guest, GuestListInstance listInstance)
        {
            guest.RsvpEmailSentDate = DateTime.Now;
        }
    }
}