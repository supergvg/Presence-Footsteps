using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Microsoft.AspNet.Identity;
using gliist_server.Models;

namespace gliist_server.Controllers
{

    [Authorize]
    public class GuestController : ApiController
    {

        private EventDBContext db = new EventDBContext();
        private UserManager<UserModel> UserManager;

        // GET api/Guest
        public IQueryable<Guest> GetGuests()
        {
            var userId = User.Identity.GetUserId();
            var user = UserManager.FindById(userId);

            return db.Guests.Where(g => string.Equals(g.company, user.company));
        }

        // GET api/Guest/5
        [ResponseType(typeof(Guest))]
        public async Task<IHttpActionResult> GetGuest(int id)
        {
            Guest guest = await db.Guests.FindAsync(id);
            if (guest == null)
            {
                return NotFound();
            }

            return Ok(guest);
        }

        // PUT api/Guest/5
        public async Task<IHttpActionResult> PutGuest(int id, Guest guest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != guest.id)
            {
                return BadRequest();
            }

            db.Entry(guest).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GuestExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST api/Guest
        [ResponseType(typeof(Guest))]
        public async Task<IHttpActionResult> PostGuest(Guest guest)
        {
            var userId = User.Identity.GetUserId();
            var user = await UserManager.FindByIdAsync(userId);


            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            guest.company = user.company;

            db.Guests.Add(guest);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = guest.id }, guest);
        }

        // DELETE api/Guest/5
        [ResponseType(typeof(Guest))]
        public async Task<IHttpActionResult> DeleteGuest(int id)
        {
            Guest guest = await db.Guests.FindAsync(id);
            if (guest == null)
            {
                return NotFound();
            }

            db.Guests.Remove(guest);
            await db.SaveChangesAsync();

            return Ok(guest);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GuestExists(int id)
        {
            return db.Guests.Count(e => e.id == id) > 0;
        }


        public GuestController()
        {
            UserManager = Startup.UserManagerFactory(db);
        }
    }
}