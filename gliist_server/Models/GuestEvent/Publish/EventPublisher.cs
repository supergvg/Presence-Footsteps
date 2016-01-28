using System;
using System.Diagnostics.CodeAnalysis;
using System.Linq;

namespace gliist_server.Models
{
    public abstract class EventPublisher
    {
        private readonly UserModel currentUser;

        protected EventDBContext DBContext;
        protected IdsEventModel PublishDetails;
        

        protected Event Event;
        protected UserModel Administrator;

        protected EventPublisher(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user)
        {
            DBContext = dbContext;
            PublishDetails = publishDetails;
            currentUser = user;
        }

        public void Run()
        {
            Initialize();

            var guestListInstances = DBContext.GuestListInstances
                .Where(x => x.linked_event.id == Event.id && PublishDetails.ids.Contains(x.id))
                .ToList();

            foreach (var listInstance in guestListInstances)
            {
                PublishList(listInstance);
            }

            Event.IsPublished = true;
            DBContext.SetModified(Event);
            DBContext.SaveChanges();
        }

        protected abstract void PublishList(GuestListInstance listInstance);

        [SuppressMessage("ReSharper", "NotResolvedInText")]
        private void Initialize()
        {
            Event = DBContext.Events.FirstOrDefault(x => x.id == PublishDetails.eventId);
            if (Event == null)
                throw new InvalidOperationException("Event is not found;");

            Administrator = currentUser.permissions == "admin"
                ? currentUser
                : Event.company.users.FirstOrDefault(x => x.permissions == "admin") ?? currentUser;
        }

        #region factory

        public static EventPublisher Create(EventDBContext dbContext, IdsEventModel publishDetails, UserModel user)
        {
            return new PrivateEventPublisher(dbContext, publishDetails, user);
        }

        #endregion

    }
}