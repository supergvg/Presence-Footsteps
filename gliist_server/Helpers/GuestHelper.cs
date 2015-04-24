using gliist_server.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace gliist_server.Helpers
{
    public static class GuestHelper
    {
        public const string ON_THE_SPOT_GL = "On The Spot";

        public static void AddGuestToEvent(Guest guest, int eventId, string userId, EventDBContext db)
        {
            throw new NotImplementedException();
            var @event = db.Events.Single(e => e.id == eventId);

            var onTheSpotGL = @event.guestLists.SingleOrDefault(gl => gl.linked_guest_list == null);

            if (onTheSpotGL == null)
            {
                onTheSpotGL = new GuestListInstance()
               {
                   linked_event = @event,
                   actual = new List<GuestCheckin>()
               };

                @event.guestLists.Add(onTheSpotGL);
            }

            onTheSpotGL.actual.Add(new GuestCheckin()
            {
                guest = guest,
                guestList = onTheSpotGL,
                plus = 0
            });

            db.Entry(@event).State = EntityState.Modified;
        }


        public async static Task<List<Guest>> Save(GuestList guestList, string userId, EventDBContext db)
        {
            List<Guest> retVal = new List<Guest>();
            var toRemove = new List<Guest>();
            foreach (var guest in guestList.guests)
            {
                if (guest.id > 0)
                {
                    var attached = guest;
                    if (!db.Guests.Local.Any(g => g.id == guest.id))
                    {
                        attached = db.Guests.Attach(guest);
                        retVal.Add(attached);
                    }

                    if (attached.userId != userId)
                    {
                        throw new UnauthorizedAccessException("User trying to get access to differnt tenant guest");
                    }
                }
                else
                {
                    var existing = await db.Guests.SingleOrDefaultAsync(g => g.userId == userId && g.email == guest.email);

                    if (existing == null)
                    {
                        db.Guests.Add(guest);
                        guest.userId = userId;
                        retVal.Add(guest);

                    }
                    else
                    {
                        toRemove.Add(guest);
                        db.Guests.Attach(existing);
                        retVal.Add(existing);
                    }

                }

            }

            foreach (var guest in toRemove)
            {
                db.Guests.Remove(guest);
            }
            return retVal;
        }
    }

}