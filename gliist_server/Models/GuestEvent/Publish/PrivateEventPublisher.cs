namespace gliist_server.Models
{
    public class PrivateEventPublisher : EventPublisher
    {
        public PrivateEventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user) 
            : base(dbContext, publishDetails, user)
        {
        }

        protected override void PublishList(GuestListInstance listInstance)
        {
            
        }

        protected override bool EventNeedsToBePublished()
        {
            return false;
        }
    }
}