using System;
using System.Linq;
using gliist_server.Models;

namespace gliist_server.Helpers
{
    public static class EventHelper
    {
        public static int GetGuestsCount(Event @event, GuestListInstance listInstance)
        {
            ValidateParameters(@event, listInstance);

            var count = 0;
            foreach(var guest in @event.EventGuestStatuses.Where(x => x.GuestListInstanceId == listInstance.id))
            {
                count += 1;

                if ((listInstance.InstanceType != GuestListInstanceType.PublicRsvp &&
                    listInstance.InstanceType != GuestListInstanceType.Rsvp) || IsConfirmed(guest, listInstance))
                {
                    count += guest.AdditionalGuestsRequested;
                }
            }

            return count;
        }

        private static bool IsConfirmed(EventGuestStatus guest, GuestListInstance listInstance)
        {
            return listInstance.actual.Any(x => x.guest.id == guest.GuestId);
        }

        private static void ValidateParameters(Event @event, GuestListInstance listInstance)
        {
            if(@event == null)
                throw new ArgumentNullException("event");

            if (listInstance == null)
                throw new ArgumentNullException("listInstance");
        }
    }
}
