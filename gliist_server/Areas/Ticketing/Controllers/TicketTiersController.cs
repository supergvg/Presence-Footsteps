using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.Areas.Ticketing.Models;
using gliist_server.Models;

namespace gliist_server.Areas.Ticketing.Controllers
{
    [Authorize]
    public class TicketTiersController : ApiController
    {
        private readonly EventDBContext db;
        private readonly ISellingFacade sellingFacade;

        public TicketTiersController()
        {
            db = new EventDBContext();
            sellingFacade = new SellingFacade();
        }

        public TicketTiersController(EventDBContext dbContext, ISellingFacade sellingFacade)
        {
            db = dbContext;
            this.sellingFacade = sellingFacade;
        }

        // GET: api/TicketTiers/5
        [ResponseType(typeof(IEnumerable<TicketTierViewModel>))]
        public IHttpActionResult Get(int id)
        {
            var ticketTiers = db.TicketTiers.Where(x => x.EventId == id).Select(x => new TicketTierViewModel
            {
                Id = x.Id,
                Name = x.Name,
                Price = x.Price,
                Quantity = x.Quantity,
                PreviousId = x.PreviousId,
                StartTime = x.StartTime,
                ExpirationTime = x.ExpirationTime
            }).ToList();

            AddSoldTickets(ticketTiers);

            return Ok(ticketTiers);
        }

        // POST: api/TicketTiers
        [ResponseType(typeof (TicketTierViewModel))]
        public IHttpActionResult Post(TicketTier model)
        {
            if (model == null)
                return BadRequest("Ticket tier is NULL.");

            var soldTickets = (model.Id > 0)
                ? sellingFacade.GetSoldTicketsNumber(model.Id)
                : 0;

            var result = TicketTierValidator.Run(new TicketTierValidatorOptions
            {
                Model = model,
                DbContext = db,
                ModelState = ModelState,
                SoldTickets = soldTickets
            });

            if (result != null)
                return BadRequest(result);

            if (model.Id > 0)
                db.SetModified(model);
            else
                db.TicketTiers.Add(model);

            db.SaveChanges();

            return Ok(new TicketTierViewModel
            {
                Id = model.Id,
                Name = model.Name,
                Price = model.Price,
                Quantity = model.Quantity,
                StartTime = model.StartTime,
                PreviousId = model.PreviousId,
                ExpirationTime = model.ExpirationTime,
                SoldTicketsCount = soldTickets
            });
        }

        // DELETE: api/TicketTiers/5
        [ResponseType(typeof(TicketTier))]
        public IHttpActionResult Delete(int id)
        {
            var ticketTier = db.TicketTiers.Find(id);
            if (ticketTier == null)
                return NotFound();

            if(db.TicketTiers.Any(x => x.PreviousId == id))
                return BadRequest("You cannot delete the ticket tier that is used as start time for another.");

            if (sellingFacade.GetSoldTicketsNumber(id) > 0)
                return BadRequest("You cannot delete the ticket tier that has sold tickets.");


            db.TicketTiers.Remove(ticketTier);
            db.SaveChanges();

            return Ok(id);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private void AddSoldTickets(IEnumerable<TicketTierViewModel> ticketTiers)
        {
            foreach (var ticketTier in ticketTiers)
            {
                ticketTier.SoldTicketsCount = sellingFacade.GetSoldTicketsNumber(ticketTier.Id);
            }
        }
    }
}