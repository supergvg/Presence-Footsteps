using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using SendGrid;

namespace gliist_server.Models
{
    abstract class EventPublisher
    {
        private readonly UserModel currentUser;
        private readonly EventDBContext dbContext;
        private readonly IdsEventModel publishDetails;

        protected readonly Event Event;
        protected UserModel Administrator;

        protected EventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user, Event @event)
        {
            this.dbContext = dbContext;
            this.publishDetails = publishDetails;
            currentUser = user;
            Event = @event;
        }

        public void Run()
        {
            Initialize();

            var guestListInstances = dbContext.GuestListInstances
                .Where(x => x.linked_event.id == Event.id && publishDetails.ids.Contains(x.id))
                .ToList();

            foreach (var listInstance in guestListInstances)
            {
                PublishList(listInstance);
            }

            Event.IsPublished = true;
            dbContext.SaveChanges();
        }

        protected abstract bool ListShouldBePublished(GuestListInstance listInstance);

        protected abstract ISendGrid PrepareSpecificMessageToGuest(EventGuestStatus guest,
            GuestListInstance listInstance);

        protected abstract bool GuestAlreadyNotificated(EventGuestStatus guest, GuestListInstance listInstance);
        protected abstract void MarkGuestAsNotificated(EventGuestStatus guest, GuestListInstance listInstance);

        #region private

        [SuppressMessage("ReSharper", "NotResolvedInText")]
        private void Initialize()
        {
            Administrator = currentUser.permissions == "admin"
                ? currentUser
                : Event.company.users.FirstOrDefault(x => x.permissions == "admin") ?? currentUser;
        }

        private IEnumerable<EventGuestStatus> GetGuestsByList(int listId)
        {
            return Event.EventGuestStatuses.Where(x => x.GuestListInstanceId == listId);
        }

        private static void SendMessage(ISendGrid message)
        {
            SendGridSender.Run(message);
        }

        private void PublishList(GuestListInstance listInstance)
        {
            if (!ListShouldBePublished(listInstance))
                return;

            var guests = GetGuestsByList(listInstance.id);

            foreach (var guest in guests)
            {
                if (Event.IsPublished && GuestAlreadyNotificated(guest, listInstance))
                    continue;

                var message = (!Event.IsPublished && GuestAlreadyNotificated(guest, listInstance))
                    ? PrepareUpdatingEmailMessage(guest, listInstance)
                    : PrepareSpecificMessageToGuest(guest, listInstance);

                SendMessage(message);

                MarkGuestAsNotificated(guest, listInstance);
            }

            listInstance.published = true;
        }

        private ISendGrid PrepareUpdatingEmailMessage(EventGuestStatus guest, GuestListInstance listInstance)
        {
            var messageBuilder = new SendGridMessageBuilder(new SendGridHeader
            {
                Subject = string.Format("{0} - Event is updated", Event.title),
                From = Administrator.company.name,
                To = guest.Guest.email
            });

            var substitutionBuilder = new SendGridSubstitutionsBuilder();
            substitutionBuilder.CreateGuestName(guest.Guest);
            substitutionBuilder.CreateEventDetails(Event, listInstance);
            substitutionBuilder.CreateOrganizer(Administrator);
            substitutionBuilder.CreateLogoAndEventImage(Administrator, Event);

            messageBuilder.ApplySubstitutions(substitutionBuilder.Result);

            messageBuilder.ApplyTemplate(SendGridTemplateIds.EventPrivateEventDetailsUpdating);
            messageBuilder.SetCategories(new[] {"Event Updated", Administrator.company.name, Event.title});

            return messageBuilder.Result;
        }

        #endregion

        #region factory

        public static EventPublisher Create(EventDBContext dbContext, IdsEventModel publishDetails,
            UserModel user, Event @event)
        {
            if (@event == null)
                throw new ArgumentNullException("event");

            switch (@event.Type)
            {
                case EventType.Rsvp:
                    return new RsvpEventPublisher(dbContext, publishDetails, user, @event);
                case EventType.Ticketing:
                    return new TicketingEventPublisher(dbContext, publishDetails, user, @event);
                default:
                    return new PrivateEventPublisher(dbContext, publishDetails, user, @event);
            }
        }

        #endregion
    }
}