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

namespace gliist_server.Controllers
{
    public class GuestListsController : ApiController
    {
        private EventDBContext db = new EventDBContext();

        // GET: api/GuestLists
        public IQueryable<GuestList> GetGuestLists()
        {
            return db.GuestLists;
        }

        // GET: api/GuestLists/5
        [ResponseType(typeof(GuestList))]
        public async Task<IHttpActionResult> GetGuestList(int id)
        {
            GuestList guestList = await db.GuestLists.FindAsync(id);
            if (guestList == null)
            {
                return NotFound();
            }

            return Ok(guestList);
        }

        // PUT: api/GuestLists/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutGuestList(int id, GuestList guestList)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != guestList.id)
            {
                return BadRequest();
            }

            db.Entry(guestList).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GuestListExists(id))
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

        // POST: api/GuestLists
        [ResponseType(typeof(GuestList))]
        public async Task<IHttpActionResult> PostGuestList(GuestList guestList)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.GuestLists.Add(guestList);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = guestList.id }, guestList);
        }

        // DELETE: api/GuestLists/5
        [ResponseType(typeof(GuestList))]
        public async Task<IHttpActionResult> DeleteGuestList(int id)
        {
            GuestList guestList = await db.GuestLists.FindAsync(id);
            if (guestList == null)
            {
                return NotFound();
            }

            db.GuestLists.Remove(guestList);
            await db.SaveChangesAsync();

            return Ok(guestList);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GuestListExists(int id)
        {
            return db.GuestLists.Count(e => e.id == id) > 0;
        }
    }
}