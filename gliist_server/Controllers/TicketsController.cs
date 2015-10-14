using System;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.ModelBinding;
using gliist_server.Shared;
using gliist_server.Helpers;
using gliist_server.Models;

namespace gliist_server.Controllers
{
    [RoutePrefix("api/tickets")]
    public class TicketsController : ApiController
    {
        private EventDBContext db;
        private bool isInitialized = false;

        public TicketsController()
            : base()
        {
            db = new EventDBContext();
        }

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
                model.Event = db.Set<Event>().Where(x => x.id == eventGuestStatus.EventId)
                    .Include(x => x.Tickets)
                    .Include(x => x.company).FirstOrDefault();
                model.Guest = db.Set<Guest>().FirstOrDefault(x => x.id == eventGuestStatus.GuestId);
                model.Company = model.Event.company;
            }
            catch (Exception ex)
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

            var @event = FindEventByName(companyName, eventName);
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
                model.Company.users = null;
                model.Company.invitations = null;
            }

            return Ok(model);
        }


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


        private Event FindEventByName(string companyName, string eventName)
        {
            var @event = db.Set<Event>()
                .Where(x => x.title.ToLower() == eventName.ToLower())
                .OrderByDescending(x => x.endTime)
                .Include(x => x.company)
                .Include(x => x.Tickets)
                .FirstOrDefault(x => x.company.name.ToLower() == companyName.ToLower());
            return @event;
        }
    }
}