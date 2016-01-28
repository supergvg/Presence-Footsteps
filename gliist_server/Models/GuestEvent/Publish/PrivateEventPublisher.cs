﻿using System;
using SendGrid;

namespace gliist_server.Models
{
    public class PrivateEventPublisher : EventPublisher
    {
        public PrivateEventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user) 
            : base(dbContext, publishDetails, user)
        {
        }

        protected override bool ListShouldBePublished(GuestListInstance listInstance)
        {
            return listInstance.InstanceType == GuestListInstanceType.Default ||
                   listInstance.InstanceType == GuestListInstanceType.Confirmed;
        }

        protected override bool GuestAlreadyNotificated(EventGuestStatus guest)
        {
            return guest.IsInvitationEmailSent;
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
            substitutionBuilder.CreateGuestDetails(guest, listInstance);
            substitutionBuilder.CreateEventDetails(Event);
            substitutionBuilder.CreateOrganizer(Administrator);
            substitutionBuilder.CreateSocialLinks(Administrator);
            substitutionBuilder.CreateLogoAndEventImage(Administrator, Event);

            messageBuilder.ApplySubstitutions(substitutionBuilder.Result);

            messageBuilder.ApplyTemplate(SendGridTemplateIdLocator.EventPrivateGuestConfirmation);
            messageBuilder.SetCategories(new[] { "Event Invitation", Administrator.company.name, Event.title });

            return messageBuilder.Result;
        }

        protected override void MarkGuestAsNotificated(EventGuestStatus guest)
        {
            guest.InvitationEmailSentDate = DateTime.UtcNow;
        }
    }
}