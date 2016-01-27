namespace gliist_server.Models
{
    public class PrivateEventPublisher : EventPublisher
    {
        public PrivateEventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user) 
            : base(dbContext, publishDetails, user)
        {
        }
    }
}