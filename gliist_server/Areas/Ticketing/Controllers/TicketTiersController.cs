using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.Areas.Ticketing.Models;
using gliist_server.Models;

namespace gliist_server.Areas.Ticketing.Controllers
{
    public class TicketTiersController : ApiController
    {
        private readonly EventDBContext db;
        private readonly ISellingFacade sellingFacade;

        public TicketTiersController()
        {
            db = new EventDBContext();
        }

        public TicketTiersController(EventDBContext dbContext, ISellingFacade sellingFacade)
        {
            db = dbContext;
            this.sellingFacade = sellingFacade;
        }

        // GET: api/TicketTiers/5
        [ResponseType(typeof(IEnumerable<TicketTierViewModel>))]
        public IHttpActionResult Get(int eventId)
        {
            return Ok(new TicketTier());
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
                SoldTicketsOfCurrentModel = soldTickets,
                SellingFacade = sellingFacade
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
                ExpirationDate = model.ExpirationDate,
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

            if (sellingFacade.GetSoldTicketsNumber(id) > 0)
                return BadRequest("You cannot delete the ticket tier that has sold tickets.");


            db.TicketTiers.Remove(ticketTier);
            db.SaveChanges();

            return Ok();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}