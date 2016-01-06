using System;
using System.Collections.Generic;
using System.Linq;

namespace gliist_server.Models
{
    public static class RsvpGuestListInstancePatch
    {
        public static void Run(GuestListInstance listInstance, IEnumerable<EventGuestStatus> eventGuests)
        {
            if(listInstance == null)
                throw new ArgumentNullException("listInstance");

            if (eventGuests == null)
                return;
            
            var eventGuestsArray = eventGuests as EventGuestStatus[] ?? eventGuests.ToArray();

            if (eventGuestsArray.Length == 0)
                return;

            PatchListIfRsvp(listInstance, eventGuestsArray);
        }

        private static void PatchListIfRsvp(GuestListInstance inst, EventGuestStatus[] eventGuestsArray)
        {
            if (inst.InstanceType == GuestListInstanceType.PublicRsvp ||
                inst.InstanceType == GuestListInstanceType.Rsvp)
            {
                inst.actual = GenerateActual(eventGuestsArray.Where(x => x.GuestListInstanceId == inst.id));
            }
        }

        private static List<GuestCheckin> GenerateActual(IEnumerable<EventGuestStatus> eventGuests)
        {
            return eventGuests.Select(guest => new GuestCheckin
            {
                status = "no show", 
                plus = 0, 
                guest = guest.Guest
            }).ToList();
        }
    }
}