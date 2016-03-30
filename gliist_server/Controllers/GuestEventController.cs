﻿using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.Attributes;
using gliist_server.DataAccess;
using gliist_server.Helpers;
using gliist_server.Models;
using Microsoft.AspNet.Identity;

namespace gliist_server.Controllers
{
    [RoutePrefix("api/GuestEventController")]
    [Authorize]
    public class GuestEventController : ApiController
    {

        private readonly EventDBContext db = new EventDBContext();
        private readonly UserManager<UserModel> userManager;

        public GuestEventController()
        {
            userManager = Startup.UserManagerFactory(db);
        }

        [Route("DeleteGuestsGuestList")]
        [HttpPost]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> DeleteGuestsGuestList(IdsModel model)
        {
            var userId = User.Identity.GetUserId();
            var user = userManager.FindById(userId);


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
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> DeleteGuestsGuestListInstance(IdsModel model)
        {
            var userId = User.Identity.GetUserId();
            var user = userManager.FindById(userId);

            var gli = await db.GuestListInstances.FindAsync(model.id);

            if (gli.linked_event.company.id != user.company.id)
            {
                return BadRequest();
            }

            foreach (var guestId in model.ids)
            {
                var idx = gli.actual.FindIndex(chkin => chkin.guest.id == guestId);
                if (idx >= 0)
                    gli.actual.RemoveAt(idx);

                RemoveGuestEvents(user, model.id, guestId);
            }

            db.Entry(gli).State = EntityState.Modified;
            await db.SaveChangesAsync();

            RsvpGuestListInstancePatch.Run(gli, db.EventGuests.Where(x => x.GuestListInstanceId == model.id));

            return Ok(gli);
        }

        private void RemoveGuestEvents(UserModel user, int listInstanceId, int guestId)
        {
            var guestEvent =
                db.EventGuests.FirstOrDefault(x => x.GuestListInstanceId == listInstanceId && x.GuestId == guestId);
            if (guestEvent != null)
            {
                if (!string.IsNullOrEmpty(guestEvent.Guest.email) &&
                    (guestEvent.IsInvitationEmailSent || guestEvent.IsRsvpEmailSent))
                    GuestDeletedEmailSender.Run(user, guestEvent);

                guestEvent.GuestListInstanceId = -1;
                guestEvent.EventId = null;
                guestEvent.Event = null;
            }
        }

        [ResponseType(typeof(Guest))]
        [Route("GetGuestCheckin")]
        [HttpGet]
        public async Task<IHttpActionResult> GetGuestCheckin(int gliId, int guestId)
        {
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
                //listType = gli.listType,
                title = gli.title
            };

            return Ok(res);
        }

        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("LinkGuestList")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> LinkGuestLists(EventGuestListLinkModel eventGuestListModel)
        {
            if (eventGuestListModel.EventId <= 0)
            {
                return BadRequest();
            }

            var userId = User.Identity.GetUserId();
            var user = await userManager.FindByIdAsync(userId);

            Event @event =
                await
                    db.Events.Include(x => x.EventGuestStatuses)
                        .FirstOrDefaultAsync(x => x.id == eventGuestListModel.EventId);

            if (@event == null || @event.company.id != user.company.id)
            {
                return BadRequest();
            }


            foreach (var guestListId in eventGuestListModel.GuestListIds)
            {
                var guestList =
                    await db.GuestLists.FirstOrDefaultAsync(x => x.company.id == user.company.id && x.id == guestListId);

                if (guestList == null)
                {
                    continue;
                }

                if (@event.guestLists.Any(x => x.linked_guest_list != null && x.linked_guest_list.id == guestList.id))
                {
                    continue;
                }

                var guestListInstance = new GuestListInstance()
                {
                    actual = new List<GuestCheckin>(),
                    linked_event = @event,
                    linked_guest_list = guestList,
                    title = guestList.title,
                    listType = guestList.listType,
                    InstanceType = eventGuestListModel.InstanceType
                };


                @event.guestLists.Add(guestListInstance);
                await db.SaveChangesAsync();


                foreach (var guest in guestList.guests)
                {
                    var guestStatus = new EventGuestStatus()
                    {
                        EventId = @event.id,
                        GuestListId = guestList.id,
                        GuestListInstanceId = guestListInstance.id,
                        GuestId = guest.id,
                        GuestListInstanceType = guestListInstance.InstanceType,
                        AdditionalGuestsRequested = guest.plus
                    };

                    @event.EventGuestStatuses.Add(guestStatus);

                    if (guestListInstance.InstanceType == GuestListInstanceType.Confirmed)
                    {
                        guestListInstance.actual.Add(new GuestCheckin()
                        {
                            guest = guest,
                            guestList = guestListInstance,
                            plus = guest.plus
                        });
                    }
                }
            }

            db.Entry(@event).State = EntityState.Modified;
            await db.SaveChangesAsync();

            if (@event.guestLists != null)
            {
                foreach (var guestListInstance in @event.guestLists)
                {
                    guestListInstance.GuestsCount = EventHelper.GetGuestsCount(@event, guestListInstance);
                }
            }
            return Ok(@event.guestLists);
        }

        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("ImportGuestList")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> ImportGuestLists(IdsModel @model)
        {
            var userId = User.Identity.GetUserId();
            var user = await userManager.FindByIdAsync(userId);


            if (@model.gl == null)
            {
                @model.gl = new GuestList()
                {
                    title = "New Guest List",
                    listType = "GA"
                };
            }


            GuestList masterGl;
            if (@model.id <= 0)
            {
                masterGl = new GuestList()
                {
                    created_by = user,
                    company = user.company,
                    title = string.Format("{0}", @model.gl.title),
                    listType = @model.gl.listType
                };

                db.GuestLists.Add(masterGl);
            }
            else
            {
                masterGl = await db.GuestLists.FindAsync(@model.id);
                db.Entry(masterGl).State = EntityState.Modified;

            }

            if (masterGl == null || masterGl.company.id != user.company.id)
            {
                return BadRequest();
            }

            foreach (var id in @model.ids)
            {
                GuestList guestList =
                    await
                        db.GuestLists.Where(gl => gl.company.id == user.company.id && gl.id == id).FirstOrDefaultAsync();
                if (guestList == null)
                {
                    continue;
                }

                foreach (var item in guestList.guests)
                {
                    masterGl.guests.Add(item);
                }
                ;
            }

            await db.SaveChangesAsync();

            return Ok(masterGl);
        }

        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("DeleteGuestList")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> DeleteGuestLists(IdsEventModel @model)
        {
            var userId = User.Identity.GetUserId();
            var user = await userManager.FindByIdAsync(userId);

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
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> AddGuest(GuestEventModel guestEvent)
        {
            var userId = User.Identity.GetUserId();
            var user = await userManager.FindByIdAsync(userId);

            var eventId = guestEvent.eventId;
            var guest = guestEvent.guest;

            if (eventId < 0)
            {
                return BadRequest();
            }
            guest.company = user.company;

            var onTheSpotGl = GuestHelper.AddGuestToEvent(guest, eventId, user.company, user, db);

            db.Guests.Add(guest);
            await db.SaveChangesAsync();

            await AddEventGuests(onTheSpotGl, new[] { guest }, eventId);


            if (!string.IsNullOrEmpty(guest.email))
            {
                var @event = onTheSpotGl.linked_event;

                if (@event != null)
                {
                    var admin = (user.permissions == "admin")
                        ? user
                        : user.company.users.FirstOrDefault(x => x.permissions == "admin") ?? user;

                    var messageBuilder = new SendGridMessageBuilder(new SendGridHeader
                    {
                        Subject = string.Format("{0} - Invitation", onTheSpotGl.linked_event.title),
                        From = admin.company.name,
                        To = guest.email
                    });

                    var substitutionBuilder = new SendGridSubstitutionsBuilder();
                    substitutionBuilder.CreateGuestName(guest);
                    substitutionBuilder.CreateGuestDetails(guest.plus, guest, onTheSpotGl);
                    substitutionBuilder.CreateEventDetails(@event, onTheSpotGl);
                    substitutionBuilder.CreateOrganizer(admin);
                    substitutionBuilder.CreateSocialLinks(admin);
                    substitutionBuilder.CreateLogoAndEventImage(admin, @event);
                    substitutionBuilder.CreateQrCode(eventId, onTheSpotGl.id, guest.id);

                    messageBuilder.ApplySubstitutions(substitutionBuilder.Result);

                    messageBuilder.ApplyTemplate(SendGridTemplateIds.EventPrivateGuestConfirmation);
                    messageBuilder.SetCategories(new[] { "Event Invitation", admin.company.name, @event.title });

                    SendGridSender.Run(messageBuilder.Result);
                }
            }

            return Ok(guest);
        }

        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("AddGuests")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> AddGuests(GuestsEventModel guestEvent)
        {
            var userId = User.Identity.GetUserId();
            var user = await userManager.FindByIdAsync(userId);

            var eventId = guestEvent.eventId;

            if (eventId < 0)
            {
                return BadRequest();
            }

            if (string.IsNullOrEmpty(guestEvent.names))
            {
                return BadRequest("invalid guests names");
            }

            var type = string.IsNullOrEmpty(guestEvent.type) ? "GA" : guestEvent.type;
            var names = guestEvent.names.Split(',');

            var addedGuests = new List<Guest>();
            GuestListInstance addedListInstance = null;

            foreach (var name in names)
            {
                var s = name.Trim().Split(' ');
                if (s.Length == 0)
                {
                    continue;
                }

                string firstName = s.Length > 0 ? s[0] : "",
                    lastName = s.Length > 1 ? s[1] : "Guest";

                var g = new Guest() { firstName = firstName, lastName = lastName, type = type, company = user.company };
                addedGuests.Add(g);

                var onTheSpotGL = GuestHelper.AddGuestToEvent(g, eventId, user.company, user, db);
                if (addedListInstance == null)
                    addedListInstance = onTheSpotGL;
                db.Guests.Add(g);
            }

            await db.SaveChangesAsync();

            await AddEventGuests(addedListInstance, addedGuests.ToArray(), eventId);

            return Ok();
        }

        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("CheckinGuest")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> CheckinGuest(CheckinModel checkinData)
        {
            var userId = User.Identity.GetUserId();
            var user = await userManager.FindByIdAsync(userId);

            var gliId = checkinData.gliId;
            var guestId = checkinData.guestId;

            var guest = await db.Guests.FindAsync(guestId);

            if (guest == null)
                return BadRequest("Guest not found.");

            var gli = await db.GuestListInstances.FindAsync(gliId);

            if (gli == null)
                return BadRequest("Guest list not found.");

            var checkin = gli.actual.Single(chkn => chkn.guest.id == guest.id);

            if (checkin == null)
                return BadRequest("Guest was not confirmed.");

            db.Entry(checkin).State = EntityState.Modified;

            var totalChk = checkinData.plus;
            if (checkin.status == "no show")
            {
                totalChk++;
            }

            //Guest Capacity
            if (checkin.status == "checked in" && (checkin.plus == 0 || totalChk == 0))
            {
                return BadRequest("Guest is already checked in.");
            }

            if (checkin.plus < checkinData.plus)
            {
                return BadRequest("Additional guests amount exceeded.");
            }

            //GL max capacity 
            if (gli.capacity > 0 && GuestHelper.GetGuestListTotalCheckedin(gli) + totalChk > gli.capacity)
            {
                return BadRequest(string.Format(@"Guest list ""{0}"" exceeded it's capacity ({1}).", gli.title, gli.capacity));
            }


            //event max capacity
            if (gli.linked_event.capacity > 0 &&
                GuestHelper.GetEventTotalCheckedin(gli.linked_event) + totalChk > gli.linked_event.capacity)
            {
                //Jocelyn wants to enable checkin even if event passed its capacity 
                //return BadRequest("Event exceeded it's capacity.");
            }

            checkin.time = DateTime.Now;
            checkin.plus = checkin.plus - checkinData.plus;
            checkin.status = "checked in";


            if (string.Compare(gli.listType, "artist", true) == 0 || string.Compare(guest.type, "artist", true) == 0)
            {
                Notification notification = new Notification()
                {
                    company = user.company,
                    message =
                        string.Format("Artist {0} {1} checked in to event {2}", guest.firstName, guest.lastName,
                            gli.linked_event.title),
                    originator = user,
                    guest = guest,
                    @event = gli.linked_event,
                    gli = gli
                };

                PushNotificationHelper.SendNotification(notification.message, user.company.id.ToString());


                db.Notifications.Add(notification);
            }
            if (string.Compare(guest.type, "super vip", true) == 0 ||
                string.Compare(gli.listType, "super vip", true) == 0)
            {
                Notification notification = new Notification()
                {
                    company = user.company,
                    message =
                        string.Format("Super VIP {0} {1} checked in to event {2}", guest.firstName, guest.lastName,
                            gli.linked_event.title),
                    originator = user,
                    guest = guest,
                    @event = gli.linked_event,
                    gli = gli
                };

                PushNotificationHelper.SendNotification(notification.message, user.company.id.ToString());


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

                PushNotificationHelper.SendNotification(glMaxNot.message, user.company.id.ToString());


                db.Notifications.Add(glMaxNot);
            }
            if (gli.linked_event.capacity > 0 &&
                GuestHelper.GetEventTotalCheckedin(gli.linked_event) >= gli.linked_event.capacity)
            {
                Notification eventMaxNot = new Notification()
                {
                    company = user.company,
                    message =
                        string.Format("Event {0} reached its capacity {1}", gli.linked_event.title,
                            gli.linked_event.capacity),
                    originator = user,
                    guest = guest,
                    @event = gli.linked_event,
                    gli = gli
                };


                PushNotificationHelper.SendNotification(eventMaxNot.message, user.company.id.ToString());


                db.Notifications.Add(eventMaxNot);
            }

            await db.SaveChangesAsync();

            return Ok(checkin);
        }

        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("UndoCheckinGuest")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> UndoCheckinGuest(CheckinModel checkinData)
        {
            if (checkinData.gliId <= 0 || checkinData.guestId <= 0)
            {
                return BadRequest();
            }

            var gli = await db.GuestListInstances.FindAsync(checkinData.gliId);
            var checkin = gli.actual.Single(x => x.guest.id == checkinData.guestId);

            var eventGuest =
                gli.linked_event.EventGuestStatuses.Single(x => x.GuestId == checkinData.guestId);

            checkin.status = "no show";
            checkin.time = null;
            checkin.plus = eventGuest.AdditionalGuestsRequested;

            await db.SaveChangesAsync();

            return Ok(checkin);
        }

        [HttpPost]
        [Route("CheckGuestsEmailBeforePublishing")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public IHttpActionResult CheckGuestsEmailBeforePublishing(IdsEventModel eventPublishModel)
        {
            var warnings = new List<string>();
            var userId = User.Identity.GetUserId();
            var user = userManager.FindById(userId);

            if (user.permissions.Contains("promoter"))
                return BadRequest("Invalid permissions");

            var @event = db.Events.FirstOrDefault(x => x.id == eventPublishModel.eventId);
            if (@event == null)
                return BadRequest("Event not found");

            var guestListInstances = db.GuestListInstances
               .Where(x => x.linked_event.id == eventPublishModel.eventId && eventPublishModel.ids.Contains(x.id))
               .ToList();

            foreach (var listInstance in guestListInstances)
            {
                if (listInstance.InstanceType == GuestListInstanceType.Rsvp ||
                    GuestListInstanceType.PublicRsvp == listInstance.InstanceType)
                {
                    var instance = listInstance;
                    var eventGuestStatuses = @event.EventGuestStatuses.Where(x => x.GuestListInstanceId == instance.id);
                    bool allGuestsHaveEmail = eventGuestStatuses.All(x => IsValidEmail(x.Guest.email));
                    if (!allGuestsHaveEmail)
                        warnings.Add(string.Format(@"Guest list ""{0}"" has guests without email address. The list will not be published.", listInstance.title));
                }
            }

            return Ok(new { Warnings = warnings });
        }

        [HttpPost]
        [Route("PublishEvent")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> PublishEvent(IdsEventModel eventPublishModel)
        {
            var userId = User.Identity.GetUserId();
            var user = userManager.FindById(userId);

            if (user.permissions.Contains("promoter"))
                return BadRequest("Invalid permissions");

            var @event = db.Events.FirstOrDefault(x => x.id == eventPublishModel.eventId);

            if (@event == null)
                return BadRequest("Event not found");

            var publisher = EventPublisher.Create(db, eventPublishModel, user, @event);

            await Task.Factory.StartNew(() =>
            {
                publisher.Run();
            });

            return StatusCode(HttpStatusCode.NoContent);
        }

        [HttpPost]
        [Route("InvitePicture")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> PostInvitePicture(int eventId)
        {
            var picData = await FileUploadHelper.RequestToStream(this.Request);

            var container = BlobHelper.GetWebApiContainer("invites");

            var blob =
                container.GetBlockBlobReference(eventId.ToString() + "_" + DateTime.Now.Millisecond + "_" +
                                                picData.Item1);

            blob.UploadFromStream(picData.Item2);

            var userId = User.Identity.GetUserId();
            UserModel user = await userManager.FindByIdAsync(userId);

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

        #region private methods
        private async Task AddEventGuests(GuestListInstance onTheSpotGl, Guest[] guests, int eventId)
        {
            db.EventGuests.AddRange(guests.Select(x => new EventGuestStatus
            {
                EventId = eventId,
                Guest = x,
                AdditionalGuestsRequested = x.plus,
                GuestListId = onTheSpotGl.linked_guest_list.id,
                GuestListInstanceId = onTheSpotGl.id,
                GuestListInstanceType = onTheSpotGl.InstanceType
            }));

            await db.SaveChangesAsync();
        }
        private static bool IsValidEmail(string email)
        {
            return (!string.IsNullOrEmpty(email) && email.Contains("@"));
        }
        #endregion
    }
}