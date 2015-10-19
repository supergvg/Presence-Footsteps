using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using gliist_server.Models;

namespace gliist_server.Helpers
{
    public static class EventHelper
    {
        public static int GetGuestsCount(GuestListInstance guestListInstance)
        {
            int count = 0;

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
    }
}
