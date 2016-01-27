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
                if (inst.actual == null || !inst.actual.Any())
                {
                    inst.actual = eventGuestsArray.Where(x => x.GuestListInstanceId == inst.id).Select(CreateEmptyCheckin).ToList();
                    return;
                }

                Patch(inst, eventGuestsArray.Where(x => x.GuestListInstanceId == inst.id));
            }
        }

        private static void Patch(GuestListInstance inst, IEnumerable<EventGuestStatus> eventGuests)
        {
            if(inst.actual == null)
                inst.actual = new List<GuestCheckin>();

            var newActual = new List<GuestCheckin>();

            foreach (var eg in eventGuests)
            {
                var existingActual = inst.actual.FirstOrDefault(x => x.guest.id == eg.Guest.id);
                if (existingActual != null)
                {
                    newActual.Add(existingActual);
                    continue;
                }
                newActual.Add(CreateEmptyCheckin(eg));
            }
            inst.actual = newActual;
        }

        private static GuestCheckin CreateEmptyCheckin(EventGuestStatus eventGuest)
        {
            return new GuestCheckin
            {
                status = "no show",
                plus = 0,
                guest = eventGuest.Guest
            };
        }
    }
}