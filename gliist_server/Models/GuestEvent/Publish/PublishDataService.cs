using System;
using System.Collections.Generic;
using System.Linq;
using gliist_server.DataAccess;

namespace gliist_server.Models
{
    class PublishDataService
    {
        private IEnumerable<CompanySettings> companySettings;

        private readonly Dictionary<int, IEnumerable<EventGuestStatus>> listInstanceGuests = new Dictionary<int, IEnumerable<EventGuestStatus>>();
        private readonly UserModel currentUser;
        private readonly EventDBContext dbContext;

        public PublishDataService(EventDBContext dbContext, UserModel user, Event @event)
        {
            if (dbContext == null)
                throw new ArgumentNullException("dbContext");
            if (user == null)
                throw new ArgumentNullException("user");
            if (@event == null)
                throw new ArgumentNullException("event");

            this.dbContext = dbContext;
            currentUser = user;
            Event = @event;
            Administrator = currentUser.permissions == "admin"
                ? currentUser
                : Event.company.users.FirstOrDefault(x => x.permissions == "admin") ?? currentUser;
        }

        public IEnumerable<GuestListInstance> GetGuestListInstances(int[] ids)
        {
            return dbContext.GuestListInstances
                .Where(x => x.linked_event.id == Event.id && ids.Contains(x.id))
                .ToList();
        }

        public Event Event { get; private set; }

        public UserModel Administrator { get; private set; }

        public IEnumerable<EventGuestStatus> GetGuestsByList(int listId)
        {
            if (!listInstanceGuests.ContainsKey(listId))
                listInstanceGuests[listId] = Event.EventGuestStatuses.Where(x => x.GuestListInstanceId == listId);

            return listInstanceGuests[listId];
        }

        public IEnumerable<CompanySettings> GetCompanySettings()
        {
            if (companySettings != null)
                return companySettings;

            companySettings = dbContext.CompanySettings.Where(x => x.CompanyId == Administrator.company.id).ToArray();

            return companySettings;
        }

        public void CommitChanges()
        {
            dbContext.SaveChanges();
        }
    }
}