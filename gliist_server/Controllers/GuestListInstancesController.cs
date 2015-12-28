using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.Models;

namespace gliist_server.Controllers
{

    [Authorize]
    public class GuestListInstancesController : ApiController
    {
        private EventDBContext db = new EventDBContext();

        // GET: api/GuestListInstances
        public IEnumerable<GuestListInstance> GetGuestListInstances()
        {
            return db.GuestListInstances
                .Include(x => x.actual)
                .ToList();
        }

        // GET: api/GuestListInstances/5
        [ResponseType(typeof(GuestListInstance))]
        public async Task<IHttpActionResult> GetGuestListInstance(int id)
        {
            GuestListInstance guestListInstance = await db.GuestListInstances.FindAsync(id);
            if (guestListInstance == null)
            {
                return NotFound();
            }

            return Ok(guestListInstance);
        }

        // PUT: api/GuestListInstances/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutGuestListInstance(int id, GuestListInstance guestListInstance)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != guestListInstance.id)
            {
                return BadRequest();
            }

            db.Entry(guestListInstance).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GuestListInstanceExists(id))
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

        // POST: api/GuestListInstances
        [ResponseType(typeof(GuestListInstance))]
        public async Task<IHttpActionResult> PostGuestListInstance(GuestListInstance guestListInstance)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (guestListInstance.id > 0)
            {
                foreach (var checkin in guestListInstance.actual)
                {

                    if (checkin.id > 0)
                    {
                        db.Entry(checkin).State = EntityState.Modified;
                    }
                    else
                    {
                        db.Entry(checkin).State = EntityState.Added;

                    }
                    if (checkin.guest.id > 0)
                    {
                        db.Entry(checkin.guest).State = EntityState.Modified;
                    }
                    else
                    {
                        checkin.guest.type = guestListInstance.listType;
                        db.Entry(checkin.guest).State = EntityState.Added;

                        AddNewGuestToTheEventsGuests(guestListInstance, checkin);
                    }
                }

                db.Entry(guestListInstance).State = EntityState.Modified;
            }
            else
            {
                db.GuestListInstances.Add(guestListInstance);
            }

            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = guestListInstance.id }, guestListInstance);
        }

        private void AddNewGuestToTheEventsGuests(GuestListInstance guestListInstance, GuestCheckin checkin)
        {
            var existingGuestListInstance = db.GuestListInstances
                    .Include(x => x.linked_guest_list)
                    .Include(x => x.linked_event)
                    .FirstOrDefault(x => x.id == guestListInstance.id);

            if (existingGuestListInstance != null && existingGuestListInstance.linked_event != null && existingGuestListInstance.linked_guest_list != null)
            {
                var evnt = existingGuestListInstance.linked_event;
                evnt.EventGuestStatuses = evnt.EventGuestStatuses ?? new List<EventGuestStatus>();

                var guestStatus = new EventGuestStatus
                {
                    EventId = evnt.id,
                    GuestListId = existingGuestListInstance.linked_guest_list.id,
                    GuestListInstanceId = guestListInstance.id,
                    GuestId = checkin.guest.id,
                    GuestListInstanceType = guestListInstance.InstanceType,
                    AdditionalGuestsRequested = checkin.guest.plus
                };

                evnt.EventGuestStatuses.Add(guestStatus);
            }

            db.Entry(existingGuestListInstance).State = EntityState.Detached;
        }

        // DELETE: api/GuestListInstances/5
        [ResponseType(typeof(GuestListInstance))]
        public async Task<IHttpActionResult> DeleteGuestListInstance(int id)
        {
            GuestListInstance guestListInstance = await db.GuestListInstances.FindAsync(id);
            if (guestListInstance == null)
            {
                return NotFound();
            }

            db.GuestListInstances.Remove(guestListInstance);
            await db.SaveChangesAsync();

            return Ok(guestListInstance);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GuestListInstanceExists(int id)
        {
            return db.GuestListInstances.Count(e => e.id == id) > 0;
        }
    }
}