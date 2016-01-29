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
            throw new System.NotImplementedException();
        }

        protected override bool GuestAlreadyNotificated(EventGuestStatus guest,
            GuestListInstance listInstance)
        {
            throw new System.NotImplementedException();
        }

        protected override ISendGrid PrepareSpecificMessageToGuest(EventGuestStatus guest, GuestListInstance listInstance)
        {
            throw new System.NotImplementedException();
        }

        protected override void MarkGuestAsNotificated(EventGuestStatus guest, GuestListInstance listInstance)
        {
            throw new System.NotImplementedException();
        }
    }
}