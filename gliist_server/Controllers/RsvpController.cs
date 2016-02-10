using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using gliist_server.Helpers;
using gliist_server.Models;
using gliist_server.Shared;

namespace gliist_server.Controllers
{
    [RoutePrefix("api/rsvp")]
    public class RsvpController : ApiController
    {
        private EventDBContext db = new EventDBContext();

        [HttpGet]
        [Route("InvitedDetails/{token}")]
        public IHttpActionResult GetEventDetailsPersonal(string token)
        {
            var emailGuestToken = GjestsLinksGenerator.ParseEventGuestToken(token);
            var responseStatus = new HttpResponseStatus();

            if (emailGuestToken == null)
            {
                responseStatus.Code = "invalid_token";
                responseStatus.Message = "Invalid token.";
                return BadRequest(responseStatus);
            }

            var eventGuestStatus = db.Set<EventGuestStatus>()
                    .FirstOrDefault(x => x.EventId == emailGuestToken.EventId && x.GuestId == emailGuestToken.GuestId);

            if (eventGuestStatus == null)
            {
                responseStatus.Code = "invalid_token";
                responseStatus.Message = "Invalid token.";
                return BadRequest(responseStatus);
            }

            var model = new EventGuestCompanyModel();
            try
            {
                model.Event = db.Set<Event>().Where(x => x.id == eventGuestStatus.EventId && !x.isDeleted)
                    .Include(x => x.company).FirstOrDefault();
                model.Guest = db.Set<Guest>().FirstOrDefault(x => x.id == eventGuestStatus.GuestId);
                model.Company = model.Event.company;
            }
            catch (Exception)
            {
                responseStatus.Code = "server_error";
                responseStatus.Message = "Server error";
                return BadRequest(responseStatus);
            }

            if (model.Event == null || model.Guest == null)
            {
                responseStatus.Code = "invalid_token";
                responseStatus.Message = "Invalid token.";
                return BadRequest(responseStatus);
            }

            model.Event.guestLists = null;
            if (model.Company != null)
            {
                if (model.Company.logo == Company.DefaultImageUrl)
                {
                    var user = model.Company.users.FirstOrDefault();
                    if (user != null)
                    {
                        model.Company.logo = user.profilePictureUrl;
                    }
                }
                model.Company.users = null;
                model.Company.invitations = null;
            }

            return Ok(model);
        }

        [HttpGet]
        [Route("PublicDetails/{companyName}/{eventName}")]
        public IHttpActionResult GetEventDetailsPublic(string companyName, string eventName)
        {
            var responseStatus = new HttpResponseStatus();

            companyName = GjestsLinksGenerator.FromUrlSafeName(companyName);
            eventName = GjestsLinksGenerator.FromUrlSafeName(eventName);

            int eventId;
            Event @event = null;
            if (int.TryParse(eventName, out eventId))
            {
                @event = db.Events.Where(x => x.id == eventId && !x.isDeleted).FirstOrDefault();
            }
            else
            {
                @event = FindEventByName(companyName, eventName);
            } 

            if (@event == null)
            {
                responseStatus.Code = "event_not_found";
                responseStatus.Message = "Event not found";
                return BadRequest(responseStatus);
            }

            var model = new EventGuestCompanyModel()
            {
                Event = @event,
                Guest = null
            };

            model.Company = model.Event.company;
            model.Event.guestLists = null;
            if (model.Company != null)
            {
                if (model.Company.logo == Company.DefaultImageUrl)
                {
                    var user = model.Company.users.FirstOrDefault();
                    if (user != null)
                    {
                        model.Company.logo = user.profilePictureUrl;
                    }
                }
                //model.Company.users = null;
                model.Company.invitations = null;
            }

            return Ok(model);
        }

        [Route("PublicConfirm")]
        public IHttpActionResult ConfirmPublicRsvp(PublicEventGuestSubmitModel eventGuestModel)
        {
            var responseStatus = new HttpResponseStatus();
            var @event = db.Events.FirstOrDefault(x => x.id == eventGuestModel.EventId && !x.isDeleted);

            if (@event == null)
            {
                responseStatus.Code = "event_not_found";
                responseStatus.Message = "Event not found";
                return BadRequest(responseStatus);
            }

            if (Common.Events.IsRsvpExpired(@event) || Common.Events.IsEventEnded(@event))
            {
                responseStatus.Code = "rsvp_expired";
                responseStatus.Message = string.Format("RSVP is allowed only until {0}", DateFormatter.Format(@event.RsvpEndDate.Value.DateTime));
                return BadRequest(responseStatus);
            }


            if (string.IsNullOrEmpty(eventGuestModel.Name))
            {
                responseStatus.Code = "guest_name_is_required";
                responseStatus.Message = "Name is required.";
                return BadRequest(responseStatus);
            }

            if (eventGuestModel.AdditionalGuests > @event.AdditionalGuests)
            {
                responseStatus.Code = "additional_guests_limit_reached";
                responseStatus.Message = string.Format("Maximum {0} additional guests are allowed for this event",
                    @event.AdditionalGuests);

                return BadRequest(responseStatus);
            }

            if (@event.IsRsvpCapacityLimited)
            {
                int guestsToAdd = 1 + eventGuestModel.AdditionalGuests;
                List<int> reseravtions = db.Set<EventGuestStatus>()
                    .Where(x => x.EventId == eventGuestModel.EventId)
                    .Select(x => x.AdditionalGuestsRequested).ToList();

                var takenSeats = reseravtions.Count + reseravtions.Sum();

                int availableSeats = (@event.capacity - takenSeats);
                if ((availableSeats - guestsToAdd) < 0)
                {
                    responseStatus.Code = "no_free_space_left";
                    responseStatus.Message = "Sorry, the event is full";
                    return BadRequest(responseStatus);
                }
            }

            if (GuestAlreadyRsvpd(@event, eventGuestModel.Email))
            {
                responseStatus.Code = "guest_";
                responseStatus.Message = "You have RSVP'd this event";

                return BadRequest(responseStatus);
            }

            var publicGuestListInstance =
                db.GuestListInstances.FirstOrDefault(
                    x => x.linked_event.id == @event.id && x.InstanceType == GuestListInstanceType.PublicRsvp);
            if (publicGuestListInstance == null)
            {
                publicGuestListInstance = new GuestListInstance()
                {
                    InstanceType = GuestListInstanceType.PublicRsvp,
                    linked_event = @event,
                    listType = "rsvp",
                    published = false,
                    title = "RSVP list"
                };
                db.GuestListInstances.Add(publicGuestListInstance);
                db.SaveChanges();
            }

            Guest guest = null;//This per Jocleyn request, she always wants to create new guest //db.Guests.FirstOrDefault(x => x.email == eventGuestModel.Email);
            if (guest == null)
            {
                string[] names = eventGuestModel.Name.Split(' ');
                guest = new Guest()
                {
                    email = eventGuestModel.Email,
                    firstName = names[0],
                    lastName = ((names.Length > 1) ? names[1] : string.Empty),
                    isPublicRegistration = true,
                    type = "RSVP",
                    plus = eventGuestModel.AdditionalGuests
                };
                try
                {
                    db.Guests.Add(guest);
                    db.SaveChanges();
                }
                catch (DbEntityValidationException ex)
                {
                    var exception = ex;
                    throw exception;
                }
                
            }

            var eventGuestStatus = db.EventGuests.FirstOrDefault(x => x.EventId == @event.id && x.GuestId == guest.id);
            if (eventGuestStatus == null)
            {
                eventGuestStatus = new EventGuestStatus()
                {
                    AdditionalGuestsRequested = eventGuestModel.AdditionalGuests,
                    GuestListInstanceType = GuestListInstanceType.PublicRsvp,
                    EventId = @event.id,
                    GuestId = guest.id,
                    GuestListId = 0,
                    GuestListInstanceId = publicGuestListInstance.id,
                };

                db.EventGuests.Add(eventGuestStatus);
                db.SaveChanges();
            }


            if (!eventGuestStatus.IsInvitationEmailSent)
            {
                SendInvitationEmail(eventGuestStatus);
                eventGuestStatus.RsvpConfirmedDate = DateTime.UtcNow;
                eventGuestStatus.InvitationEmailSentDate = DateTime.UtcNow;
                //eventGuestStatus.CheckInDate = DateTime.UtcNow;
                db.Entry(eventGuestStatus).State = EntityState.Modified;
                db.SaveChanges();
                CheckIn(eventGuestStatus);
            }

            return Ok("Your RSVP is confirmed");
        }

        [Route("InvitedConfirm")]
        public IHttpActionResult ConfirmInvitedRsvp(PersonalEventGuestSubmitModel eventGuestModel)
        {
            var eventGuestStatus = db.Set<EventGuestStatus>()
                .FirstOrDefault(x => x.EventId == eventGuestModel.EventId && x.GuestId == eventGuestModel.GuestId);

            var responseStatus = new HttpResponseStatus();

            if (eventGuestStatus == null)
            {
                responseStatus.Code = "guest_not_found";
                responseStatus.Message = "Guest not found";
                return BadRequest();
            }

            if (eventGuestStatus.IsRsvpConfirmed)
            {
                return Ok("RSVP is already confirmed");
            }

            var @event = db.Set<Event>()
                .FirstOrDefault(x => x.id == eventGuestModel.EventId && !x.isDeleted);

            if (@event == null)
            {

                responseStatus.Code = "event_not_found";
                responseStatus.Message = "Event not found";
                return BadRequest(responseStatus);
            }

            if (Common.Events.IsEventEnded(@event))
            {
                responseStatus.Code = "event_ended";
                responseStatus.Message = "Event has already ended";
                return BadRequest(responseStatus);
            }

            if (Common.Events.IsRsvpExpired(@event) || Common.Events.IsEventEnded(@event))
            {
                responseStatus.Code = "rsvp_expired";
                responseStatus.Message = string.Format("RSVP is allowed only until {0}", DateFormatter.Format(@event.RsvpEndDate.Value.DateTime));
                return BadRequest(responseStatus);
            }

            if (eventGuestModel.AdditionalGuests > @event.AdditionalGuests)
            {
                responseStatus.Code = "additional_guests_limit_reached";
                responseStatus.Message = string.Format("Maximum {0} additional guests are allowed for this event",
                    @event.AdditionalGuests);
            }

            if (@event.IsRsvpCapacityLimited)
            {
                int guestsToAdd = 1 + eventGuestModel.AdditionalGuests;
                List<int> reseravtions = db.Set<EventGuestStatus>()
                    .Where(x => x.EventId == eventGuestModel.EventId)
                    .Select(x => x.AdditionalGuestsRequested).ToList();

                var takenSeats = reseravtions.Count + reseravtions.Sum();

                int availableSeats = (@event.capacity - takenSeats);

                if ((availableSeats - guestsToAdd) < 0)
                {
                    responseStatus.Code = "no_free_space_left";
                    responseStatus.Message = "Sorry, the event is full";
                    return BadRequest(responseStatus);
                }
            }

            if (!eventGuestStatus.IsInvitationEmailSent)
            {
                SendInvitationEmail(eventGuestStatus);
                eventGuestStatus.AdditionalGuestsRequested = eventGuestModel.AdditionalGuests;
                eventGuestStatus.RsvpConfirmedDate = DateTime.UtcNow;
                eventGuestStatus.InvitationEmailSentDate = DateTime.UtcNow;
                //eventGuestStatus.CheckInDate = DateTime.UtcNow;
                db.Entry(eventGuestStatus).State = EntityState.Modified;
                db.SaveChanges();
                CheckIn(eventGuestStatus);
            }

            return Ok("Your RSVP is confirmed");
        }

        #region private methods
        private IHttpActionResult BadRequest<T>(T value)
        {
            var defaultNegotiator = Configuration.Services.GetContentNegotiator();
            var negotationResult = defaultNegotiator.Negotiate(typeof(T), Request, Configuration.Formatters);
            var response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new ObjectContent<T>(value, negotationResult.Formatter, negotationResult.MediaType)
            };
            return ResponseMessage(response);
        }

        private void CheckIn(EventGuestStatus eventGuestStatus)
        {
            var guest = db.Guests.FirstOrDefault(x => x.id == eventGuestStatus.GuestId);
            var guestListInstance = db.GuestListInstances
                .Include(x => x.actual)
                .FirstOrDefault(x => x.id == eventGuestStatus.GuestListInstanceId);

            guestListInstance.actual.Add(new GuestCheckin()
            {
                guest = guest,
                guestList = guestListInstance,
                plus = guest.plus
            });
            db.Entry(guestListInstance).State = EntityState.Modified;

            db.Entry(eventGuestStatus).State = EntityState.Modified;
            db.SaveChanges();
        }

        private void SendInvitationEmail(EventGuestStatus eventGuestStatus)
        {
            var @event = db.Set<Event>()
                    .Include(x => x.company)
                    .Include(x => x.EventGuestStatuses)
                    .FirstOrDefault(x => x.id == eventGuestStatus.EventId && !x.isDeleted);

            var guest = db.Set<Guest>().FirstOrDefault(x => x.id == eventGuestStatus.GuestId);
            var user = @event.company.users.FirstOrDefault(x => x.permissions == "admin")
                       ?? @event.company.users.First();

            var guestListInstance = db.Set<GuestListInstance>()
                .FirstOrDefault(x => x.id == eventGuestStatus.GuestListInstanceId);

            var substitutions = new Dictionary<string, string>();

            var eventImageDimensions = ImageHelper.GetImageSizeByUrl(@event.invitePicture);
            eventImageDimensions = ImageHelper.GetScaledDimensions(eventImageDimensions, ImageHelper.EventEmailImageMaxWidth,
                ImageHelper.EventEmailImageMaxHeight);

            if (eventImageDimensions != null)
            {
                substitutions.Add(":event_image_width", eventImageDimensions.Width.ToString());
                substitutions.Add(":event_image_height", eventImageDimensions.Height.ToString());
            }
            var logoImageDimensions = ImageHelper.GetImageSizeByUrl(user.profilePictureUrl);
            logoImageDimensions = ImageHelper.GetScaledDimensions(logoImageDimensions, ImageHelper.LogoEmailImageMaxWidth,
                ImageHelper.LogoEmailImageMaxHeight);

            if (logoImageDimensions != null)
            {
                substitutions.Add(":logo_image_width", logoImageDimensions.Width.ToString());
                substitutions.Add(":logo_image_height", logoImageDimensions.Height.ToString());
            }

            EmailHelper.SendInvite(user, @event, guest, guestListInstance, Request.RequestUri.Authority, substitutions);
        }

        private Event FindEventByName(string companyName, string eventName)
        {
            var @event = db.Set<Event>()
                .Where(x => x.title.ToLower() == eventName.ToLower() && !x.isDeleted)
                .OrderByDescending(x => x.endTime)
                .Include(x => x.company)
                .Include(x => x.Tickets)
                .FirstOrDefault(x => x.company.name.ToLower() == companyName.ToLower());
            return @event;
        }

        private static bool GuestAlreadyRsvpd(Event @event, string email)
        {
            var publicInstance = @event.guestLists.FirstOrDefault(x => x.InstanceType == GuestListInstanceType.PublicRsvp);

            if (publicInstance == null)
                return false;


            return @event.EventGuestStatuses.Count(x => x.GuestListInstanceId == publicInstance.id &&
                x.Guest.email == email) > 0;
        }

        #endregion
    }
}