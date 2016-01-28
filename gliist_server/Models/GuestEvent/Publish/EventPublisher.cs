using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using SendGrid;

namespace gliist_server.Models
{
    public abstract class EventPublisher
    {
        private readonly UserModel currentUser;
        private readonly EventDBContext dbContext;
        private readonly IdsEventModel publishDetails;

        protected Event Event;
        protected UserModel Administrator;

        protected EventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user)
        {
            this.dbContext = dbContext;
            this.publishDetails = publishDetails;
            currentUser = user;
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
            dbContext.SetModified(Event);
            dbContext.SaveChanges();
        }

        protected abstract bool ListShouldBePublished(GuestListInstance listInstance);
        protected abstract ISendGrid PrepareSpecificMessageToGuest(EventGuestStatus guest, GuestListInstance listInstance);
        protected abstract bool GuestAlreadyNotificated(EventGuestStatus guest);
        protected abstract void MarkGuestAsNotificated(EventGuestStatus guest);

        #region private

        [SuppressMessage("ReSharper", "NotResolvedInText")]
        private void Initialize()
        {
            Event = dbContext.Events.FirstOrDefault(x => x.id == publishDetails.eventId);
            if (Event == null)
                throw new InvalidOperationException("Event is not found;");

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
                if (Event.IsPublished && GuestAlreadyNotificated(guest))
                    continue;

                var message = (!Event.IsPublished && GuestAlreadyNotificated(guest))
                    ? PrepareUpdatingEmailMessage(guest)
                    : PrepareSpecificMessageToGuest(guest, listInstance);

                SendMessage(message);

                guest.InvitationEmailSentDate = DateTime.UtcNow;

                MarkGuestAsNotificated(guest);
                dbContext.SetModified(guest);
            }

            listInstance.published = true;
            dbContext.SetModified(listInstance);
        }

        private ISendGrid PrepareUpdatingEmailMessage(EventGuestStatus guest)
        {
            var messageBuilder = new SendGridMessageBuilder(new SendGridHeader
            {
                Subject = string.Format("{0} - Invitation. Event was updated", Event.title),
                From = Administrator.company.name,
                To = guest.Guest.email
            });

            var substitutionBuilder = new SendGridSubstitutionsBuilder();
            substitutionBuilder.CreateGuestName(guest.Guest);
            substitutionBuilder.CreateEventDetails(Event);
            substitutionBuilder.CreateOrganizer(Administrator);
            substitutionBuilder.CreateSocialLinks(Administrator);
            substitutionBuilder.CreateLogoAndEventImage(Administrator, Event);

            messageBuilder.ApplySubstitutions(substitutionBuilder.Result);

            messageBuilder.ApplyTemplate(SendGridTemplateIdLocator.EventPrivateEventDetailsUpdating);
            messageBuilder.SetCategories(new[] { "Event Updated", Administrator.company.name, Event.title });

            return messageBuilder.Result;
        }

        #endregion

        #region factory

        public static EventPublisher Create(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user)
        {
            return new PrivateEventPublisher(dbContext, publishDetails, user);
        }

        #endregion
    }
}