using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.Areas.Ticketing.Models;
using gliist_server.Models;

namespace gliist_server.Areas.Ticketing.Controllers
{
    public class TicketTiersController : ApiController
    {
        private readonly EventDBContext db;

        public TicketTiersController()
        {
            db = new EventDBContext();
        }

        public TicketTiersController(EventDBContext dbContext)
        {
            db = dbContext;
        }

        // GET: api/TicketTiers/5
        [ResponseType(typeof(TicketTier))]
        public IHttpActionResult Get(int eventId)
        {
            return Ok(new TicketTier());
        }

        // POST: api/TicketTiers
        [ResponseType(typeof (TicketTier))]
        public IHttpActionResult Post(TicketTier model)
        {
            var result = TicketTierValidator.Run(model, db, ModelState);
            if (result != null)
                return BadRequest(result);

            if (model.Id > 0)
                db.SetModified(model);
            else
                db.TicketTiers.Add(model);

            db.SaveChanges();

            return Ok(model);
        }

        // DELETE: api/TicketTiers/5

        [ResponseType(typeof(TicketTier))]
        public IHttpActionResult Delete(int id)
        {
            TicketTier ticketTier = db.TicketTiers.Find(id);
//            if (TicketTier == null)
//            {
//                return NotFound();
//            }
//
            db.TicketTiers.Remove(ticketTier);
//            db.SaveChanges();

            return Ok(new TicketTier());
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                //db.Dispose();
            }
            base.Dispose(disposing);
        }

        
    }
}