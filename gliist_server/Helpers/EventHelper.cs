using System.Linq;
using gliist_server.Models;

namespace gliist_server.Helpers
{
    static class EventHelper
    {
        public static int GetGuestsCount(Event @event, GuestListInstance listInstance)
        {
            var count = 0;
            foreach(var guest in @event.EventGuestStatuses.Where(x => x.GuestListInstanceId == listInstance.id))
            {
                count += 1;

                if (listInstance.InstanceType != GuestListInstanceType.PublicRsvp &&
                    listInstance.InstanceType != GuestListInstanceType.Rsvp)
                {
                    count += guest.AdditionalGuestsRequested;
                }
            }

            return count;
        }
    }
}
