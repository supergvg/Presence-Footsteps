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
        public const string ON_THE_SPOT_GL = "On the spot";



        public static int GetEventTotalCheckedin(Event @event)
        {
            var total = 0;

            foreach (var gli in @event.guestLists)
            {
                total += GuestHelper.GetGuestListTotalCheckedin(gli);
            }

            return total;
        }

        public static int GetGuestListTotalCheckedin(GuestListInstance gli)
        {
            var total = 0;
            foreach (var chckin in gli.actual)
            {
                if (chckin.status == "no show")
                {
                    continue;
                }

                total += (chckin.guest.plus - chckin.plus) + 1;
            }

            return total;
        }

        public static GuestListInstance AddGuestToEvent(Guest guest, int eventId, Company comapny, UserModel user, EventDBContext db)
        {
            var @event = db.Events.Single(e => e.id == eventId);

            var onTheSpotGL = @event.guestLists.SingleOrDefault(gl => string.Equals(gl.linked_guest_list.listType, ON_THE_SPOT_GL));

            if (onTheSpotGL == null)
            {
                onTheSpotGL = new GuestListInstance()
               {
                   linked_event = @event,
                   actual = new List<GuestCheckin> { 
                       new GuestCheckin() { 
                           guest = guest,
                            guestList = onTheSpotGL,
                            plus = guest.plus
                       } 
                   },
                   linked_guest_list = new GuestList()
                   {
                       created_by = user,
                       company = comapny,
                       title = string.Format("{0}", ON_THE_SPOT_GL),
                       listType = ON_THE_SPOT_GL,
                       guests = new List<Guest>()
                       {
                          guest
                       }
                   },
                   title = string.Format("{0}", ON_THE_SPOT_GL),
                   listType = ON_THE_SPOT_GL
               };

                @event.guestLists.Add(onTheSpotGL);
            }
            else
            {
                onTheSpotGL.linked_guest_list.guests.Add(guest);
                onTheSpotGL.actual.Add(
                     new GuestCheckin()
                     {
                         guest = guest,
                         guestList = onTheSpotGL,
                         plus = guest.plus
                     }
                    );
            }

            Notification notification = new Notification()
            {
                company = comapny,
                message = string.Format("{0} {1} has been added to {2}", guest.firstName, guest.lastName, @event.title),
                originator = user,
                guest = guest,
                @event = @event,
                gli = onTheSpotGL
            };


            db.Notifications.Add(notification);
            db.Entry(@event).State = EntityState.Modified;


            return onTheSpotGL;
        }


        public async static Task<List<Guest>> Save(GuestList guestList, Company company, EventDBContext db, List<Guest> toMerge = null)
        {
            toMerge = toMerge != null ? new List<Guest>() : toMerge;

            List<Guest> retVal = new List<Guest>();
            var toRemove = new List<Guest>();
            foreach (var guest in guestList.guests)
            {
                var mergeG = toMerge.FirstOrDefault(g => g.email == guest.email);

                if (guest.id > 0)
                {
                    var attached = guest;
                    if (!db.Guests.Local.Any(g => g.id == guest.id))
                    {

                        attached = db.Guests.Attach(guest);
                        retVal.Add(attached);
                    }

                    db.Entry(guest).State = EntityState.Modified;


                    if (attached.company.id != company.id)
                    {
                        throw new UnauthorizedAccessException("User trying to get access to differnt tenant guest");
                    }
                }
                else
                {
                    var existing = await db.Guests.SingleOrDefaultAsync(g => g.company.id == company.id && g.email == guest.email);

                    if (existing == null)
                    {
                        db.Guests.Add(guest);
                        guest.company = company;
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