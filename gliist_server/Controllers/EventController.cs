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
using System.Web.Http.Cors;


namespace gliist_server.Controllers
{
    [RoutePrefix("api/Event")]

    [Authorize]
    public class EventController : ApiController
    {
        private UserManager<UserModel> UserManager;
        private EventDBContext db = new EventDBContext();

        // GET api/Event
        public IQueryable<Event> GetEvents()
        {
            var userId = User.Identity.GetUserId();

            var user = UserManager.FindById(userId);
            var events = db.Events.Where(e => e.company.id == user.company.id && !e.isDeleted);

            return events;
        }

        [Route("CurrentEvents")]
        public IQueryable<Event> GetCurrentEvents()
        {
            var userId = User.Identity.GetUserId();

            var user = UserManager.FindById(userId);
            var events = db.Events.Where(e => e.company.id == user.company.id && e.time >= DateTime.Now && !e.isDeleted);

            return events;
        }

        [Route("PastEvents")]
        public IQueryable<Event> GetPastEvents()
        {
            var userId = User.Identity.GetUserId();

            var user = UserManager.FindById(userId);
            var events = db.Events.Where(e => e.company.id == user.company.id && e.time < DateTime.Now && !e.isDeleted);

            return events;

        }

        // GET api/Event/5
        [ResponseType(typeof(Event))]
        public async Task<IHttpActionResult> GetEvent(int id)
        {
            Event @event = await db.Events.FindAsync(id);
            if (@event == null)
            {
                return NotFound();
            }

            return Ok(@event);
        }

        // PUT api/Event/5
        public async Task<IHttpActionResult> PutEvent(int id, Event @event)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != @event.id)
            {
                return BadRequest();
            }

            var userId = User.Identity.GetUserId();

            db.Entry(@event).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST api/Event
        [ResponseType(typeof(Event))]
        public async Task<IHttpActionResult> PostEvent(Event @event)
        {
            if (@event == null)
            {
                return BadRequest(ModelState);
            }

            var userId = User.Identity.GetUserId();
            var user = await UserManager.FindByIdAsync(userId);

            @event.company = user.company;

            if (@event.time == DateTime.MinValue)
            {
                @event.time = DateTime.Today;
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (@event.id > 0)
            {
                db.Entry(@event).State = EntityState.Modified;

                foreach (var gli in @event.guestLists)
                {
                    db.Entry(gli).State = EntityState.Modified;
                }
            }
            else
            {
                db.Events.Add(@event);
            }

            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = @event.id }, @event);
        }

        // DELETE api/Event/5
        [ResponseType(typeof(Event))]
        public async Task<IHttpActionResult> DeleteEvent(int id)
        {

            var userId = User.Identity.GetUserId();
            var user = UserManager.FindById(userId);

            Event @event = db.Events.Where(e => e.id == id && e.company.id == user.company.id).FirstOrDefault();


            if (@event == null)
            {
                return NotFound();
            }

            @event.isDeleted = true;
            db.Entry(@event).State = EntityState.Modified;

            await db.SaveChangesAsync();

            return Ok(@event);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool EventExists(int id)
        {
            return db.Events.Count(e => e.id == id) > 0;
        }

        public EventController()
        {
            UserManager = Startup.UserManagerFactory(db);
        }


    }
}