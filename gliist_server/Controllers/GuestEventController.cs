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
using System.Dynamic;
using System.IO;
using System.Net.Http.Headers;

namespace gliist_server.Controllers
{

    public class GuestGuestListInstanceModel
    {
        public int guestId { get; set; }
        public int gliId { get; set; }
    }


    public class GuestEventModel
    {
        public Guest guest { get; set; }
        public int eventId { get; set; }
    }

    public class IdsModel
    {
        public int[] ids { get; set; }

        public int id { get; set; }
    }

    public class IdsEventModel
    {
        public int[] ids { get; set; }

        public int eventId { get; set; }
    }

    public class CheckinModel
    {
        public int gliId { get; set; }

        public int guestId { get; set; }

        public int plus { get; set; }
    }

    [RoutePrefix("api/GuestEventController")]
    [Authorize]
    public class GuestEventController : ApiController
    {

        private EventDBContext db = new EventDBContext();
        private UserManager<UserModel> UserManager;


        [Route("DeleteGuestsGuestList")]
        [HttpPost]
        public async Task<IHttpActionResult> DeleteGuestsGuestList(IdsModel model)
        {
            var userId = User.Identity.GetUserId();
            var user = UserManager.FindById(userId);


            var gli = await db.GuestLists.FindAsync(model.id);

            if (gli.company.id != user.company.id)
            {
                return BadRequest();
            }


            foreach (var guestId in model.ids)
            {
                var idx = gli.guests.FindIndex(g => g.id == guestId);
                gli.guests.RemoveAt(idx);
            }

            db.Entry(gli).State = EntityState.Modified;
            await db.SaveChangesAsync();

            return Ok(gli);
        }

        [Route("DeleteGuestsGuestListInstance")]
        [HttpPost]
        public async Task<IHttpActionResult> DeleteGuestsGuestListInstance(IdsModel model)
        {
            var userId = User.Identity.GetUserId();
            var user = UserManager.FindById(userId);


            var gli = await db.GuestListInstances.FindAsync(model.id);

            if (gli.linked_guest_list.company.id != user.company.id)
            {
                return BadRequest();
            }


            foreach (var guestId in model.ids)
            {
                var idx = gli.actual.FindIndex(chkin => chkin.guest.id == guestId);
                gli.actual.RemoveAt(idx);
            }

            db.Entry(gli).State = EntityState.Modified;
            await db.SaveChangesAsync();

            return Ok(gli);
        }



        [ResponseType(typeof(Guest))]
        [Route("GetGuestCheckin")]
        [HttpGet]
        public async Task<IHttpActionResult> GetGuestCheckin(int gliId, int guestId)
        {
            var userId = User.Identity.GetUserId();

            var gli = await db.GuestListInstances.FindAsync(gliId);

            var guestInfo = gli.actual.FirstOrDefault(a => a.guest.id == guestId);
            if (guestInfo == null)
            {
                return BadRequest();
            }
            dynamic res = new ExpandoObject();
            res.checkin = guestInfo;
            res.gl_instance = new GuestListInstance()
            {
                id = gli.id,
                listType = gli.listType,
                title = gli.title
            };

            return Ok(res);
        }


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
            var user = await UserManager.FindByIdAsync(userId);

            Event @event = await db.Events.FindAsync(@model.eventId);

            if (@event == null || @event.company.id != user.company.id)
            {
                return BadRequest();
            }


            foreach (var id in @model.ids)
            {
                GuestList guestList = await db.GuestLists.Where(gl => gl.company.id == user.company.id && gl.id == id).FirstOrDefaultAsync();
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
                                    linked_guest_list = guestList,
                                    title = guestList.title,
                                    listType = guestList.listType
                                };

                foreach (var item in guestList.guests)
                {
                    glInstance.actual.Add(new GuestCheckin()
                    {
                        guest = item,
                        guestList = glInstance,
                        plus = item.plus
                    });
                };

                @event.guestLists.Add(glInstance);
            }

            db.Entry(@event).State = EntityState.Modified;
            await db.SaveChangesAsync();

            return Ok(@event.guestLists);
        }

        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("DeleteGuestList")]
        public async Task<IHttpActionResult> DeleteGuestLists(IdsEventModel @model)
        {
            var userId = User.Identity.GetUserId();
            var user = await UserManager.FindByIdAsync(userId);

            Event @event = await db.Events.FindAsync(@model.eventId);

            if (@event == null || @event.company.id != user.company.id)
            {
                return BadRequest();
            }

            var gli_id = @model.ids.First();

            var idx = @event.guestLists.FindIndex(g => g.id == gli_id);

            var gli = @event.guestLists[idx];

            gli.linked_event = null;
            @event.guestLists.RemoveAt(idx);


            db.Entry(@event).State = EntityState.Modified;
            db.Entry(gli).State = EntityState.Modified;

            await db.SaveChangesAsync();

            return Ok(@event.guestLists);
        }


        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("AddGuest")]
        public async Task<IHttpActionResult> AddGuest(GuestEventModel guestEvent)
        {
            var userId = User.Identity.GetUserId();
            var user = await UserManager.FindByIdAsync(userId);

            var eventId = guestEvent.eventId;
            var guest = guestEvent.guest;

            if (eventId < 0)
            {
                return BadRequest();
            }
            guest.company = user.company;

            var onTheSpotGL = GuestHelper.AddGuestToEvent(guest, eventId, user.company, user, db);

            db.Guests.Add(guest);

            await db.SaveChangesAsync();

            EmailHelper.SendInvite(user, onTheSpotGL.linked_event, guest, onTheSpotGL, Request.RequestUri.Authority);

            return Ok(guest);
        }


        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("CheckinGuest")]
        public async Task<IHttpActionResult> CheckinGuest(CheckinModel checkinData)
        {
            var userId = User.Identity.GetUserId();
            var user = await UserManager.FindByIdAsync(userId);

            var gliId = checkinData.gliId;
            var guestId = checkinData.guestId;

            if (gliId <= 0 || guestId <= 0)
            {
                return BadRequest();
            }

            var guest = await db.Guests.FindAsync(guestId);
            var gli = await db.GuestListInstances.FindAsync(gliId);
            var checkin = gli.actual.Single(chkn => chkn.guest.id == guest.id);

            db.Entry(checkin).State = EntityState.Modified;


            if (guest.company.id != user.company.id)
            {
                return BadRequest();
            }

            var totalChk = checkinData.plus;
            if (checkin.status == "no show")
            {
                totalChk++;
            }

            //Guset Capacity
            if (checkin.plus < checkinData.plus || (checkin.status == "checked in" && checkin.plus == 0))
            {
                throw new ArgumentException("guest exceeded capacity");
            }

            //GL max capacity 
            if (gli.capacity > 0 && GuestHelper.GetGuestListTotalCheckedin(gli) + totalChk > gli.capacity)
            {
                throw new ArgumentException("guest list exceeded capacity");
            }


            //event max capacity
            if (gli.linked_event.capacity > 0 && GuestHelper.GetEventTotalCheckedin(gli.linked_event) + totalChk > gli.linked_event.capacity)
            {
                throw new ArgumentException("event exceeded capacity");
            }


            checkin.time = DateTimeOffset.Now;
            checkin.plus = checkin.plus - checkinData.plus;
            checkin.status = "checked in";


            if (string.Compare(gli.listType, "artist", true) > -1 || string.Compare(guest.type, "artist", true) > -1)
            {
                Notification notification = new Notification()
                {
                    company = user.company,
                    message = string.Format("Artist {0} {1} checked in to event {2}", guest.firstName, guest.lastName, gli.linked_event.title),
                    originator = user,
                    guest = guest,
                    @event = gli.linked_event,
                    gli = gli
                };


                db.Notifications.Add(notification);
            }
            if (string.Compare(guest.type, "super vip", true) > -1 || string.Compare(gli.listType, "super vip", true) > -1)
            {
                Notification notification = new Notification()
                {
                    company = user.company,
                    message = string.Format("Super VIP {0} {1} checked in to event {2}", guest.firstName, guest.lastName, gli.linked_event.title),
                    originator = user,
                    guest = guest,
                    @event = gli.linked_event,
                    gli = gli
                };


                db.Notifications.Add(notification);
            }

            if (gli.capacity > 0 && GuestHelper.GetGuestListTotalCheckedin(gli) >= gli.capacity)
            {
                Notification glMaxNot = new Notification()
                {
                    company = user.company,
                    message = string.Format("Guest List {0} reached its capacity {1}", gli.title, gli.capacity),
                    originator = user,
                    guest = guest,
                    @event = gli.linked_event,
                    gli = gli
                };


                db.Notifications.Add(glMaxNot);
            }
            if (gli.linked_event.capacity > 0 && GuestHelper.GetEventTotalCheckedin(gli.linked_event) >= gli.linked_event.capacity)
            {
                Notification eventMaxNot = new Notification()
                {
                    company = user.company,
                    message = string.Format("Event {0} reached its capacity {1}", gli.linked_event.title, gli.linked_event.capacity),
                    originator = user,
                    guest = guest,
                    @event = gli.linked_event,
                    gli = gli
                };


                db.Notifications.Add(eventMaxNot);
            }

            await db.SaveChangesAsync();

            return Ok(checkin);
        }


        [HttpPost]
        [Route("PublishEvent")]
        public async Task<IHttpActionResult> PubishEvent(int eventId)
        {
            var userId = User.Identity.GetUserId();
            UserModel user = UserManager.FindById(userId);

            if (user.permissions.Contains("promoter"))
            {
                return BadRequest("Invaid permissions");
            }


            Event @event = await db.Events.FindAsync(eventId);
            if (@event == null)
            {
                return NotFound();
            }

            foreach (var gli in @event.guestLists)
            {
                foreach (var checkin in gli.actual)
                {
                    EmailHelper.SendInvite(user, @event, checkin.guest, gli, Request.RequestUri.Authority);
                }

            }

            return StatusCode(HttpStatusCode.NoContent);
        }



        [HttpPost]
        [Route("InvitePicture")]
        public async Task<IHttpActionResult> PostInvitePicture(int eventId)
        {
            var picData = await FileUploadHelper.RequestToStream(this.Request);

            var container = BlobHelper.GetWebApiContainer("invites");

            var blob = container.GetBlockBlobReference(eventId.ToString() + "_" + DateTime.Now.Millisecond + "_" + picData.Item1);

            blob.UploadFromStream(picData.Item2);

            var userId = User.Identity.GetUserId();
            UserModel user = await UserManager.FindByIdAsync(userId);

            Event @event = await db.Events.FindAsync(eventId);
            if (@event == null || @event.company.id != user.company.id)
            {
                return NotFound();
            }

            @event.invitePicture = blob.Uri.AbsoluteUri;

            db.Entry(@event).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(@event.invitePicture);
        }

        public GuestEventController()
        {
            UserManager = Startup.UserManagerFactory(db);
        }
    }
}