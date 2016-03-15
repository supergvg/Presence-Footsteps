using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.DataAccess;
using gliist_server.Models;

namespace gliist_server.Controllers
{

    [Authorize]
    public class GuestListInstancesController : ApiController
    {
        private readonly EventDBContext db = new EventDBContext();

        // GET: api/GuestListInstances
        public IEnumerable<GuestListInstance> GetGuestListInstances()
        {
            return db.GuestListInstances
                .Include(x => x.actual)
                .ToList();
        }

        // GET: api/GuestListInstances/5
        [ResponseType(typeof (GuestListInstance))]
        public async Task<IHttpActionResult> GetGuestListInstance(int id)
        {
            var guestListInstance = await db.GuestListInstances.FindAsync(id);
            if (guestListInstance == null)
            {
                return NotFound();
            }

            RsvpGuestListInstancePatch.Run(guestListInstance, db.EventGuests.Where(x => x.GuestListInstanceId == id));

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
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/GuestListInstances
        [ResponseType(typeof (GuestListInstance))]
        public async Task<IHttpActionResult> PostGuestListInstance(GuestListInstance guestListInstance)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (guestListInstance.InstanceType == GuestListInstanceType.PublicRsvp &&
                guestListInstance.actual.Any(x => x.id == 0))
                return BadRequest("Adding guests to public RSVP list manually is not allowed.");
            
            var linkedEvent =
                db.GuestListInstances.Where(x => x.id == guestListInstance.id).Select(x => x.linked_event).First();

            PatchCheckins(guestListInstance, linkedEvent);

            var checkins = guestListInstance.actual.ToArray();

            if (guestListInstance.InstanceType == GuestListInstanceType.Rsvp ||
                guestListInstance.InstanceType == GuestListInstanceType.PublicRsvp)
                guestListInstance.actual.Clear();

            if (guestListInstance.id > 0)
            {
                foreach (var checkin in checkins)
                {
                    if (checkin.id > 0)
                    {
                        db.Entry(checkin).State = EntityState.Modified;
                    }
                    else if (guestListInstance.InstanceType != GuestListInstanceType.Rsvp &&
                             guestListInstance.InstanceType != GuestListInstanceType.PublicRsvp)
                    {
                        db.Entry(checkin).State = EntityState.Added;

                    }
                    if (checkin.guest.id > 0)
                    {
                        db.Entry(checkin.guest).State = EntityState.Modified;
                        UpdateEventsGuest(checkin, linkedEvent);
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

            return CreatedAtRoute("DefaultApi", new {id = guestListInstance.id}, guestListInstance);
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

        #region private methods

        private void UpdateEventsGuest(GuestCheckin checkin, Event linkedEvent)
        {
            var guestEvent =
                db.EventGuests.FirstOrDefault(x => x.EventId == linkedEvent.id && x.GuestId == checkin.guest.id);
            if (guestEvent != null)
            {
                guestEvent.AdditionalGuestsRequested = checkin.guest.plus;
            }
        }

        private void PatchCheckins(GuestListInstance guestListInstance, Event linkedEvent)
        {
            GuestCheckinPlusUpdatingPatch.Run(guestListInstance,
                db.EventGuests.Where(x => x.EventId == linkedEvent.id).ToArray());
        }

        private void AddNewGuestToTheEventsGuests(GuestListInstance guestListInstance, GuestCheckin checkin)
        {
            var existingGuestListInstance = db.GuestListInstances
                .Include(x => x.linked_guest_list)
                .Include(x => x.linked_event)
                .FirstOrDefault(x => x.id == guestListInstance.id);

            if (existingGuestListInstance != null && existingGuestListInstance.linked_event != null &&
                existingGuestListInstance.linked_guest_list != null)
            {
                var evnt = existingGuestListInstance.linked_event;
                evnt.EventGuestStatuses = evnt.EventGuestStatuses ?? new List<EventGuestStatus>();

                var guestStatus = new EventGuestStatus
                {
                    EventId = evnt.id,
                    GuestListId = existingGuestListInstance.linked_guest_list.id,
                    GuestListInstanceId = guestListInstance.id,
                    Guest = checkin.guest,
                    GuestListInstanceType = guestListInstance.InstanceType,
                    AdditionalGuestsRequested = checkin.guest.plus
                };

                evnt.EventGuestStatuses.Add(guestStatus);
            }

            db.Entry(existingGuestListInstance).State = EntityState.Detached;
        }

        private bool GuestListInstanceExists(int id)
        {
            return db.GuestListInstances.Count(e => e.id == id) > 0;
        }

        #endregion

    }
}