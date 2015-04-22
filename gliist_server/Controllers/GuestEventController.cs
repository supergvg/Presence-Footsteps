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
    [RoutePrefix("api/GuestEventController")]
    [Authorize]
    public class GuestEventController : ApiController
    {
        private EventDBContext db = new EventDBContext();



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

            await GuestHelper.AddGuestToEvent(guest, eventId, userId, db);

            db.Guests.Add(guest);

            await db.SaveChangesAsync();

            return Ok(guest);
        }
    }

}