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

            Event @event = await db.Events.FindAsync(@model.eventId);

            if (@event == null || @event.userId != userId)
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
            var eventId = guestEvent.eventId;
            var guest = guestEvent.guest;

            if (eventId < 0)
            {
                return BadRequest();
            }
            guest.userId = userId;
            GuestHelper.AddGuestToEvent(guest, eventId, userId, db);

            db.Guests.Add(guest);

            await db.SaveChangesAsync();

            return Ok(guest);
        }


        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("CheckinGuest")]
        public async Task<IHttpActionResult> CheckinGuest(CheckinModel checkinData)
        {
            var userId = User.Identity.GetUserId();
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


            if (guest.userId != userId)
            {
                return BadRequest();
            }

            if (checkin.plus < checkinData.plus || (checkin.status == "checked in" && checkin.plus == 0))
            {
                throw new ArgumentException("guest exceeded maximoum plus");
            }

            checkin.time = DateTime.Now;
            checkin.plus = checkin.plus - checkinData.plus;
            checkin.status = "checked in";

            await db.SaveChangesAsync();

            return Ok(checkin);
        }

        [HttpPost]
        [Route("InvitePicture")]
        public async Task<IHttpActionResult> PostInvitePicture(int eventId)
        {
            var profilePicImage = await FileUploadHelper.FilesToBytes(this.Request);

            var userId = User.Identity.GetUserId();

            Event @event = await db.Events.FindAsync(eventId);
            if (@event == null || @event.userId != userId)
            {
                return NotFound();
            }

            @event.invitePictureData = profilePicImage.Item2;
            @event.invitePicture = profilePicImage.Item1;

            db.Entry(@event).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }
        static byte[] _eventPlaceHolder;

        [Route("InvitePicture")]
        [AllowAnonymous]
        public async Task<HttpResponseMessage> GetEventInvite(int eventId)
        {
            var userId = User.Identity.GetUserId();

            Event @event = await db.Events.FindAsync(eventId);
            if (@event == null)
            {
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            }

            Stream imgStream;
            string fileName;

            if (string.IsNullOrEmpty(@event.invitePicture) || @event.invitePictureData == null)
            {
                var path = System.Web.HttpContext.Current.Server.MapPath("~/images/event_placeholder.jpg");
                fileName = "event_placeholder.jpg";

                if (_eventPlaceHolder == null)
                {
                    _eventPlaceHolder = File.ReadAllBytes(path);
                }

                imgStream = new MemoryStream(_eventPlaceHolder);
            }
            else
            {
                imgStream = new MemoryStream(@event.invitePictureData);
                fileName = @event.invitePicture;

            }
            var resp = new HttpResponseMessage()
            {
                Content = new StreamContent(imgStream)
            };

            // Find the MIME type
            string mimeType = FileUploadHelper.GetMimeType(Path.GetExtension(fileName));
            resp.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);

            return resp;
        }
    }
}