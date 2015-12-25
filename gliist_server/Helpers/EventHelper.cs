using System.Linq;
using gliist_server.Models;

namespace gliist_server.Helpers
{
    static class EventHelper
    {
        public static int GetGuestsCount(GuestListInstance guestListInstance)
        {
            var count = 0;

            var guestList = guestListInstance.linked_guest_list;
            var guestCheckins = guestListInstance.actual;

            if (guestList != null)
            {
                if (guestListInstance.InstanceType == GuestListInstanceType.PublicRsvp ||
                    guestListInstance.InstanceType == GuestListInstanceType.Rsvp)
                {
                    count = guestList.guests.Count();
                }
                else
                {
                    count += guestList.guests.Sum(x => 1 + x.plus);
                }
            }
            else if (guestCheckins != null)
            {
                if (guestListInstance.InstanceType == GuestListInstanceType.PublicRsvp ||
                    guestListInstance.InstanceType == GuestListInstanceType.Rsvp)
                {
                    count = guestCheckins.Count();
                }
                else
                {
                    count += guestCheckins.Sum(x => 1 + x.plus);
                }
            }

            return count;
        }

        public static int GetGuestsCount2(Event @event, GuestListInstance listInstance)
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
