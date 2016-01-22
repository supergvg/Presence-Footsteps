using System.Linq;
using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.Areas.Ticketing.Models;
using gliist_server.Models;

namespace gliist_server.Areas.Ticketing.Controllers
{
    public class TicketTypesController : ApiController
    {
        private readonly EventDBContext db;

        public TicketTypesController()
        {
            db = new EventDBContext();
        }

        public TicketTypesController(EventDBContext dbContext)
        {
            db = dbContext;
        }

        // GET: api/TicketTypes/5
        [ResponseType(typeof(TicketType))]
        public IHttpActionResult Get(int eventId)
        {
            return Ok(new TicketType());
        }

        // POST: api/TicketTypes
        [ResponseType(typeof(TicketType))]
        public IHttpActionResult Post(TicketType ticketType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //db.TicketTypes.Add(ticketType);
            db.SaveChanges();

            return CreatedAtRoute("Ticketing_default", new { id = ticketType.Id }, ticketType);
        }

        // DELETE: api/TicketTypes/5
        [ResponseType(typeof(TicketType))]
        public IHttpActionResult Delete(int id)
        {
//            TicketType ticketType = db.TicketTypes.Find(id);
//            if (ticketType == null)
//            {
//                return NotFound();
//            }
//
//            db.TicketTypes.Remove(ticketType);
//            db.SaveChanges();

            return Ok(new TicketType());
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