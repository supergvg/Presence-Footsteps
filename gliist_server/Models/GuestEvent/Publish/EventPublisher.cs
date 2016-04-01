﻿using System;
using gliist_server.DataAccess;
using SendGrid;

namespace gliist_server.Models
{
    abstract class EventPublisher
    {
        private readonly IdsEventModel publishDetails;

        protected readonly PublishDataService DataService;

        protected EventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user, Event @event)
        {
            this.publishDetails = publishDetails;
            DataService = new PublishDataService(dbContext, user, @event);
        }

        public void Run()
        {
            var guestListInstances = DataService.GetGuestListInstances(publishDetails.ids);

            foreach (var listInstance in guestListInstances)
            {
                PublishList(listInstance);
            }

            DataService.GetEvent().IsPublished = true;
            DataService.CommitChanges();
        }

        protected abstract bool ListShouldBePublished(GuestListInstance listInstance);

        protected abstract ISendGrid PrepareSpecificMessageToGuest(EventGuestStatus guest,
            GuestListInstance listInstance);

        protected abstract bool GuestAlreadyNotificated(EventGuestStatus guest, GuestListInstance listInstance);
        protected abstract void MarkGuestAsNotificated(EventGuestStatus guest, GuestListInstance listInstance);

        protected static bool IsValidEmail(string email)
        {
            return (!string.IsNullOrEmpty(email) && email.Contains("@"));
        }

        #region private

        private static void SendMessage(ISendGrid message)
        {
            SendGridSender.Run(message);
        }

        private void PublishList(GuestListInstance listInstance)
        {
            if (!ListShouldBePublished(listInstance))
                return;

            var guests = DataService.GetGuestsByList(listInstance.id);

            foreach (var guest in guests)
            {
                if (!IsValidEmail(guest.Guest.email) || (DataService.GetEvent().IsPublished && GuestAlreadyNotificated(guest, listInstance)))
                    continue;

                var message = (!DataService.GetEvent().IsPublished && GuestAlreadyNotificated(guest, listInstance))
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
                Subject = string.Format("{0} - Event is updated", DataService.GetEvent().title),
                From = DataService.GetAdministrator().company.name,
                To = guest.Guest.email
            });

            var substitutionBuilder = new SendGridSubstitutionsBuilder();
            substitutionBuilder.CreateGuestName(guest.Guest);
            substitutionBuilder.CreateEventDetails(DataService.GetEvent(), listInstance);
            substitutionBuilder.CreateOrganizer(DataService.GetAdministrator());
            substitutionBuilder.CreateLogoAndEventImage(DataService.GetAdministrator(), DataService.GetEvent());

            messageBuilder.ApplySubstitutions(substitutionBuilder.Result);

            messageBuilder.ApplyTemplate(SendGridTemplateIds.EventPrivateEventDetailsUpdating);
            messageBuilder.SetCategories(new[] { "Event Updated", DataService.GetAdministrator().company.name, DataService.GetEvent().title });

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