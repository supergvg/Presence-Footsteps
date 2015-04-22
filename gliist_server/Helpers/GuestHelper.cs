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

        public static void AddGuestToEvent(Guest guest, Event @event, EventDBContext db)
        {

           var onTheSpotGL = @event.guestLists.SingleOrDefault(gl => string.Equals(gl.title, ON_THE_SPOT_GL));


           if (onTheSpotGL == null)
           {

           }
           else
           {

           }
            

            

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