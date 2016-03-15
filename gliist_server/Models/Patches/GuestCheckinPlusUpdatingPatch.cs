using System;
using System.Collections.Generic;
using System.Linq;
using gliist_server.DataAccess;

namespace gliist_server.Models
{
    public class GuestCheckinPlusUpdatingPatch
    {
        public static void Run(GuestListInstance listInstance, EventGuestStatus[] eventGuests)
        {
            if(listInstance == null)
                throw new ArgumentNullException("listInstance");

            if(!IsModificationRequired(listInstance, eventGuests))
                return;

            foreach (var checkin in listInstance.actual)
            {
                PatchCheckin(checkin, eventGuests);
            }
        }

        private static bool IsModificationRequired(GuestListInstance listInstance, IEnumerable<EventGuestStatus> eventGuests)
        {
            if (eventGuests == null || !eventGuests.Any())
                return false;

            if(listInstance.InstanceType == GuestListInstanceType.Rsvp ||
                listInstance.InstanceType == GuestListInstanceType.PublicRsvp)
                return false;

            return true;
        }

        private static void PatchCheckin(GuestCheckin checkin, IEnumerable<EventGuestStatus> eventGuests)
        {
            if (checkin.status != "checked in")
            {
                checkin.plus = checkin.guest.plus;
                return;
            }

            var eventGuest = eventGuests.FirstOrDefault(x => x.GuestId == checkin.guest.id);
            if (eventGuest != null)
            {
                var plus = checkin.guest.plus - (eventGuest.AdditionalGuestsRequested - checkin.plus);
                checkin.plus = (plus >= 0) ? plus : 0;

            }
        }
    }
}