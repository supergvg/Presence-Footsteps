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

        // GET: api/TicketTypes/5
        [ResponseType(typeof(TicketTier))]
        public IHttpActionResult Get(int eventId)
        {
            return Ok(new TicketTier());
        }

        // POST: api/TicketTypes
        [ResponseType(typeof(TicketTier))]
        public IHttpActionResult Post(TicketTier ticketTier)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //db.TicketTypes.Add(TicketTier);
            db.SaveChanges();

            return CreatedAtRoute("Ticketing_default", new { id = ticketTier.Id }, ticketTier);
        }

        // DELETE: api/TicketTypes/5
        [ResponseType(typeof(TicketTier))]
        public IHttpActionResult Delete(int id)
        {
//            TicketTier TicketTier = db.TicketTypes.Find(id);
//            if (TicketTier == null)
//            {
//                return NotFound();
//            }
//
//            db.TicketTypes.Remove(TicketTier);
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