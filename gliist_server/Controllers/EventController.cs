using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.Attributes;
using gliist_server.Models;
using Microsoft.AspNet.Identity;
using gliist_server.Helpers;
using gliist_server.Shared;


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
        public IList<EventViewModel> GetCurrentEvents()
        {
            var userId = User.Identity.GetUserId();

            var user = UserManager.FindById(userId);

            var events = db.Events.Where(e => e.company.id == user.company.id && !e.isDeleted)
                .OrderBy(e => e.time)
                .AsEnumerable()
                .Where(e => DateTimeOffset.Compare(e.time + new TimeSpan(24, 0, 0), DateTimeOffset.Now) >= 0 &&
                    (!user.permissions.Contains("promoter") || e.guestLists != null && e.guestLists.Count > 0 && e.guestLists.Any(y => y.linked_guest_list != null && y.linked_guest_list.promoter_Id == user.Id)))
                .ToList();

            var targetList = events
                .ToList()
                .Select(x => new EventViewModel(x))
                .ToList();
            return targetList;
        }

        [Route("PastEvents")]
        public IList<EventViewModel> GetPastEvents()
        {
            var userId = User.Identity.GetUserId();

            var user = UserManager.FindById(userId);
            var events = db.Events.Where(e => e.company.id == user.company.id && !e.isDeleted).OrderBy(e => e.time)
                .AsEnumerable()
                .Where(e => DateTimeOffset.Compare(e.time + new TimeSpan(24, 0, 0), DateTimeOffset.Now) < 0 &&
                    (!user.permissions.Contains("promoter") || e.guestLists != null && e.guestLists.Count > 0 && e.guestLists.Any(y => y.linked_guest_list != null && y.linked_guest_list.promoter_Id == user.Id)))
                .ToList();

            var targetList = events
                .Select(x => new EventViewModel(x) { })
                .ToList();

            return targetList;
        }

        // GET api/Event/GuestsListsExcelFile/{eventId}?authToken={token}
        [HttpGet]
        [Route("GuestsListsExcelFile/{eventId}")]
        public HttpResponseMessage GetGuestsListsExcelFile(int eventId)
        {
            var db = new EventDBContext();
            var @event = db.Events.Find(eventId);
            var excelFile = ExcelHelper.CreateGuestsListsExcelFile(@event.guestLists);

            MediaTypeHeaderValue mimeType = new MediaTypeHeaderValue("application/vnd.ms-excel");

            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(excelFile);
            response.Content.Headers.ContentType = mimeType;
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
            string fileName = string.Format("{0}_{1}.xls", (!string.IsNullOrEmpty(@event.title)) ? @event.title : @event.id.ToString(), DateTime.Today.ToString("MM-dd-yyyy"));
            response.Content.Headers.ContentDisposition.FileName = fileName;

            return response;
        }

        // GET api/Event/5
        [ResponseType(typeof(Event))]
        public async Task<IHttpActionResult> GetEvent(int id)
        {
            Event @event = await db.Events.FindAsync(id);
            var userId = User.Identity.GetUserId();
            var user = UserManager.FindById(userId);

            if (@event == null || user.company.id != @event.company.id)
            {
                return NotFound();
            }

            if (@event.guestLists != null)
            {
                if (user.permissions.Contains("promoter"))
                {
                    @event.guestLists = @event.guestLists.Where(x => x.linked_guest_list != null && x.linked_guest_list.promoter_Id == user.Id).ToList();
                }

                foreach (var guestListInstance in @event.guestLists)
                {
                    var guestsCount = EventHelper.GetGuestsCount(guestListInstance);
                    guestListInstance.GuestsCount = guestsCount;
                }

                @event.GuestListsHaveAdditionalGuests = CheckGuestListsHaveAdditionalGuests(@event);
            }

            return Ok(@event);
        }

        private bool CheckGuestListsHaveAdditionalGuests(Event evnt)
        {
            if (evnt.guestLists == null || 
                evnt.guestLists.Count(x => x.linked_guest_list != null && x.linked_guest_list.guests != null && x.linked_guest_list.guests.Count > 0) == 0)
            {
                return false;
            }

            var guestListInstancesGuestsIds = evnt.guestLists.Where(x => x.linked_guest_list != null && x.linked_guest_list.guests != null).Select(x => x.linked_guest_list).SelectMany(x => x.guests).Select(x => x.id);
            var actualGuests = db.EventGuests.Where(x => x.EventId == evnt.id).ToList();

            foreach (var guest in actualGuests)
            {
                if (!guestListInstancesGuestsIds.Contains(guest.GuestId))
                {
                    return true;
                }
            }

            return false;
        }

        // PUT api/Event/5
        [CheckAccess(DeniedPermissions = "promoter")]
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
            var user = await UserManager.FindByIdAsync(userId);

            if (user.permissions.Contains("promoter") || user.permissions.Contains("staff"))
            {
                return BadRequest("Invalid permissions");
            }

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
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> PostEvent(Event @event)
        {
            if (@event == null)
            {
                return BadRequest(ModelState);
            }

            var userId = User.Identity.GetUserId();
            var user = await UserManager.FindByIdAsync(userId);

            if (user.permissions.Contains("promoter") || user.permissions.Contains("staff"))
            {
                return BadRequest("Invalid permissions");
            }

            @event.company = user.company;

            if (@event.time == DateTimeOffset.MinValue)
            {
                @event.time = DateTimeOffset.Now;
            }

            @event.time = new DateTimeOffset(@event.time.Year, @event.time.Month, @event.time.Day, @event.time.Hour, @event.time.Minute, @event.time.Second, new TimeSpan(0, 0, @event.utcOffset)).AddHours(-@event.userOffset);

            @event.endTime = new DateTimeOffset(@event.endTime.Year, @event.endTime.Month, @event.endTime.Day, @event.endTime.Hour, @event.endTime.Minute, @event.endTime.Second, new TimeSpan(0, 0, @event.utcOffset)).AddHours(-@event.userOffset);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (@event.Type == EventType.Ticketing && @event.Tickets.Count == 0)
            {
                return BadRequest("Tickets are required for this type of event");
            }
            else if (@event.Type == EventType.Rsvp && @event.RsvpEndDate == null)
            {
                return BadRequest("rsvpEndDate is required for this type of event");
            }

            if (@event.Tickets != null && @event.Tickets.Count > 0)
            {
                if (@event.Type == EventType.Ticketing)
                {
                    @event.Tickets.ForEach(x => x.EventId = @event.id);
                }
                else
                {
                    @event.Tickets.Clear();
                }

            }

            var generateRSVPLink = false;
            if (@event.id > 0)
            {
                var existingEvent = db.Events.FirstOrDefault(x => x.id == @event.id);
                var isPublished = false;

                if (existingEvent == null)
                {
                    return BadRequest("Event not found");
                }

                if (existingEvent.IsPublished)
                {
                    var hasChanges =
                        existingEvent.IsRsvpCapacityLimited != @event.IsRsvpCapacityLimited ||
                        existingEvent.AdditionalDetails != @event.AdditionalDetails ||
                        existingEvent.FacebookPageUrl != @event.FacebookPageUrl ||
                        existingEvent.InstagrammPageUrl != @event.InstagrammPageUrl ||
                        (existingEvent.RsvpEndDate.HasValue && @event.RsvpEndDate.HasValue && 
                            existingEvent.RsvpEndDate.Value.ToString("MM/dd/yyyy HH:mm") != @event.RsvpEndDate.Value.ToString("MM/dd/yyyy HH:mm")
                        ) ||
                        existingEvent.RsvpType != @event.RsvpType ||
                        existingEvent.RsvpUrl != @event.RsvpUrl ||
                        existingEvent.TicketingUrl != @event.TicketingUrl ||
                        existingEvent.TwitterPageUrl != @event.TwitterPageUrl ||
                        existingEvent.category != @event.category ||
                        existingEvent.description != @event.description ||
                        existingEvent.invitePicture != @event.invitePicture ||
                        existingEvent.location != @event.location ||
                        existingEvent.title != @event.title ||
                        existingEvent.Type != @event.Type ||
                        existingEvent.time.ToString("MM/dd/yyyy HH:mm") != @event.time.ToString("MM/dd/yyyy HH:mm") ||
                        existingEvent.endTime.ToString("MM/dd/yyyy HH:mm") != @event.endTime.ToString("MM/dd/yyyy HH:mm") ||
                        existingEvent.capacity != @event.capacity;

                    isPublished = !hasChanges && existingEvent.IsPublished;
                }

                @event.IsPublished = isPublished;

                foreach (var gli in @event.guestLists)
                {
                    db.Entry(gli).State = (gli.id > 0) ? EntityState.Modified : EntityState.Added;

                    if (@event.NeedToUpdateEventsGuests)
                    {
                        AddNewGuestsFromGuestListToEvent(@event, gli, existingEvent);
                    }
                }

                foreach (var ticketType in @event.Tickets)
                {
                    db.Entry(ticketType).State = (ticketType.Id > 0) ? EntityState.Modified : EntityState.Added;
                }

                db.Entry(existingEvent).CurrentValues.SetValues(@event);
            }
            else
            {
                generateRSVPLink = true;
                db.Events.Add(@event);
            }
            await db.SaveChangesAsync();

            if (generateRSVPLink)
            {
                var linkCreator = new GjestsLinksGenerator(ConfigurationManager.AppSettings["appBaseUrl"]);
                @event.RsvpUrl = linkCreator.GeneratePublicRsvpLandingPageLink(@event.company.name, @event.id.ToString());
                @event.TicketingUrl = linkCreator.GeneratePublicTicketsLandingPageLink(@event.company.name, @event.id.ToString());
            }

            return CreatedAtRoute("DefaultApi", new { id = @event.id }, @event);
        }

        private void AddNewGuestsFromGuestListToEvent(Event @event, GuestListInstance gli, Event existingEvent)
        {
            var guestListInstance = db.GuestListInstances.Include(x => x.linked_guest_list).FirstOrDefault(x => x.id == gli.id);

            if (guestListInstance == null)
            {
                return;
            }

            foreach (var guest in guestListInstance.linked_guest_list.guests)
            {
                var eventGuest = db.EventGuests.FirstOrDefault(x => x.EventId == @event.id && x.GuestId == guest.id);

                if (eventGuest == null)
                {
                    var guestStatus = new EventGuestStatus
                    {
                        EventId = @event.id,
                        GuestListId = guestListInstance.linked_guest_list.id,
                        GuestListInstanceId = gli.id,
                        GuestId = guest.id,
                        GuestListInstanceType = gli.InstanceType,
                        AdditionalGuestsRequested = guest.plus
                    };

                    if (@event.EventGuestStatuses == null)
                    {
                        @event.EventGuestStatuses = existingEvent.EventGuestStatuses;
                    }

                    @event.EventGuestStatuses.Add(guestStatus);

                    if (gli.InstanceType == GuestListInstanceType.Confirmed)
                    {
                        gli.actual.Add(new GuestCheckin()
                        {
                            guest = guest,
                            guestList = gli,
                            plus = guest.plus
                        });
                        guestStatus.IsAutoCheckIn = true;
                        guestStatus.CheckInDate = DateTime.UtcNow;
                    }
                }
            }
        }

        // DELETE api/Event/5
        [ResponseType(typeof(Event))]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> DeleteEvent(int id)
        {

            var userId = User.Identity.GetUserId();
            var user = UserManager.FindById(userId);

            if (user.permissions.Contains("promoter") || user.permissions.Contains("staff"))
            {
                return BadRequest("Invalid permissions");
            }

            Event @event = db.Events.FirstOrDefault(e => e.id == id && e.company.id == user.company.id);


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