using System;
using SendGrid;

namespace gliist_server.Models
{
    public class RsvpEventPublisher : EventPublisher
    {
        public RsvpEventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user) 
            : base(dbContext, publishDetails, user)
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

        protected override ISendGrid PrepareSpecificMessageToGuest(EventGuestStatus guest, GuestListInstance listInstance)
        {
            throw new NotImplementedException();
        }

        protected override void MarkGuestAsNotificated(EventGuestStatus guest)
        {
            guest.RsvpEmailSentDate = DateTime.UtcNow;
        }
    }
}