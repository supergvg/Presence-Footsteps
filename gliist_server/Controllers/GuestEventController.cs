using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.Models;
using Microsoft.AspNet.Identity;
using gliist_server.Helpers;

namespace gliist_server.Controllers
{

    public class GuestEventModel
    {
        public Guest guest { get; set; }
        public int eventId { get; set; }
    }

    public class IdsEventModel
    {
        public int[] ids { get; set; }

        public int eventId { get; set; }
    }

    [RoutePrefix("api/GuestEventController")]
    [Authorize]
    public class GuestEventController : ApiController
    {
        private EventDBContext db = new EventDBContext();

        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("LinkGuestList")]
        public async Task<IHttpActionResult> LinkGuestLists(IdsEventModel @model)
        {
            if (@model.eventId <= 0)
            {
                return BadRequest();
            }

            var userId = User.Identity.GetUserId();
            Event @event = await db.Events.FindAsync(@model.eventId);

            if (@event == null || @event.userId != userId)
            {
                return BadRequest();
            }


            foreach (var id in @model.ids)
            {
                GuestList guestList = await db.GuestLists.Where(gl => gl.userId == userId && gl.id == id).FirstOrDefaultAsync();
                if (guestList == null)
                {
                    continue;
                }
                if (@event.guestLists.Any(gli => gli.linked_guest_list == guestList))
                {
                    continue;
                }

                var glInstance = new GuestListInstance()
                {
                    actual = new List<GuestCheckin>(),
                    linked_event = @event,
                    linked_guest_list = guestList
                };


                @event.guestLists.Add(glInstance);
            }

            db.Entry(@event).State = EntityState.Modified;
            await db.SaveChangesAsync();

            return Ok(@event.guestLists);
        }


        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("AddGuest")]
        public async Task<IHttpActionResult> AddGuest(GuestEventModel guestEvent)
        {
            var userId = User.Identity.GetUserId();
            var eventId = guestEvent.eventId;
            var guest = guestEvent.guest;

            if (eventId < 0)
            {
                return BadRequest();
            }

            GuestHelper.AddGuestToEvent(guest, eventId, userId, db);

            db.Guests.Add(guest);

            await db.SaveChangesAsync();

            return Ok(guest);
        }


        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("CheckinGuest")]
        public async Task<IHttpActionResult> CheckinGuest(GuestEventModel guestEvent)
        {
            var userId = User.Identity.GetUserId();
            var eventId = guestEvent.eventId;
            var guest = guestEvent.guest;

            if (eventId < 0)
            {
                return BadRequest();
            }

            throw new NotImplementedException();
            GuestHelper.AddGuestToEvent(guest, eventId, userId, db);

            db.Guests.Add(guest);

            await db.SaveChangesAsync();

            return Ok(guest);
        }
    }

}