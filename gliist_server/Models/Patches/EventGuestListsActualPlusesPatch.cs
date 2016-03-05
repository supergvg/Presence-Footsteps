using System;
using System.Collections.Generic;
using System.Linq;

namespace gliist_server.Models
{
    public class EventGuestListsActualPlusesPatch
    {
        public static void Run(Event @event)
        {
            if (@event == null)
                throw new ArgumentNullException("event");

            if(@event.guestLists == null || !@event.guestLists.Any())
                return;

            if(@event.EventGuestStatuses == null || !@event.EventGuestStatuses.Any())
                return;


            foreach (var checkin in @event.guestLists.SelectMany(x => x.actual))
            {
                PatchCheckin(checkin, @event.EventGuestStatuses);
            }
        }

        private static void PatchCheckin(GuestCheckin checkin, IEnumerable<EventGuestStatus> eventGuestStatuses)
        {
            var eventGuest = eventGuestStatuses
                .FirstOrDefault(x => x.GuestId == checkin.guest.id && x.GuestListInstanceId == checkin.gl_id);

            if(eventGuest == null)
                return;

            checkin.guest.plus = eventGuest.AdditionalGuestsRequested;
        }
    }
}