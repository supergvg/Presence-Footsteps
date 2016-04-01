using System;
using System.Collections.Generic;
using System.Linq;
using gliist_server.DataAccess;
using SendGrid;

namespace gliist_server.Models
{
    class  PrivateEventPublisher : EventPublisher
    {
        public PrivateEventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user, Event @event) 
            : base(dbContext, publishDetails, user, @event)
        {
        }

        protected override bool ListShouldBePublished(GuestListInstance listInstance)
        {
            return listInstance.InstanceType == GuestListInstanceType.Default ||
                   listInstance.InstanceType == GuestListInstanceType.Confirmed;
        }

        protected override bool GuestAlreadyNotificated(EventGuestStatus guest, GuestListInstance listInstance)
        {
            return (listInstance.InstanceType == GuestListInstanceType.Default ||
                    listInstance.InstanceType == GuestListInstanceType.Confirmed) && guest.IsInvitationEmailSent;
        }

        protected override ISendGrid PrepareSpecificMessageToGuest(EventGuestStatus guest, 
            GuestListInstance listInstance)
        {
            var messageBuilder = new SendGridMessageBuilder(new SendGridHeader
            {
                Subject = string.Format("{0} - Invitation", DataService.GetEvent().title),
                From = DataService.GetAdministrator().company.name,
                To = guest.Guest.email
            });

            var substitutionBuilder = new SendGridSubstitutionsBuilder();
            substitutionBuilder.CreateGuestName(guest.Guest);
            substitutionBuilder.CreateGuestDetails(guest.AdditionalGuestsRequested, guest.Guest, listInstance);
            substitutionBuilder.CreateEventDetails(DataService.GetEvent(), listInstance);
            substitutionBuilder.CreateOrganizer(DataService.GetAdministrator());
            substitutionBuilder.CreateSocialLinks(DataService.GetAdministrator());
            substitutionBuilder.CreateLogoAndEventImage(DataService.GetAdministrator(), DataService.GetEvent());
            substitutionBuilder.CreateQrCode(DataService.GetEvent().id, listInstance.id, guest.GuestId);

            messageBuilder.ApplySubstitutions(substitutionBuilder.Result);

            messageBuilder.ApplyTemplate(GetTemplate());
            messageBuilder.SetCategories(new[] { "Event Invitation", DataService.GetAdministrator().company.name, DataService.GetEvent().title });

            return messageBuilder.Result;
        }

        private string GetTemplate()
        {
            var settings = DataService.GetCompanySettings().FirstOrDefault(x => x.Key == "ConfirmationEmailTemplateId");

            return (settings != null) 
                ? settings.Value 
                : SendGridTemplateIds.EventPrivateGuestConfirmation;
        }

        protected override void MarkGuestAsNotificated(EventGuestStatus guest, 
            GuestListInstance listInstance)
        {
            guest.InvitationEmailSentDate = DateTime.Now;
        }
    }
}