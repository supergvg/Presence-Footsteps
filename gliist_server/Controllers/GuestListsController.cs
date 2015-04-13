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
using Microsoft.AspNet.Identity;


namespace gliist_server.Controllers
{
    [RoutePrefix("api/GuestLists")]
    public class GuestListsController : ApiController
    {
        private EventDBContext db = new EventDBContext();

        // GET: api/GuestLists
        public IQueryable<GuestList> GetGuestLists()
        {
            var userId = User.Identity.GetUserId();

            return db.GuestLists.Where(gl => gl.userId == userId);
        }

        // GET: api/GuestLists/5
        [ResponseType(typeof(GuestList))]
        public async Task<IHttpActionResult> GetGuestList(int id)
        {
            var userId = User.Identity.GetUserId();

            GuestList guestList = await db.GuestLists.Where(gl => gl.userId == userId && gl.id == id).FirstOrDefaultAsync();
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
            var userId = User.Identity.GetUserId();

            GuestList existingGuestList;
            if (guestList.id > 0)
            {
                existingGuestList = await db.GuestLists.Where(gl => gl.userId == userId && gl.id == guestList.id).SingleOrDefaultAsync();
                if (existingGuestList == null)
                {
                    throw new NotImplementedException();
                }
                existingGuestList.title = guestList.title;
                existingGuestList.guests = guestList.guests;
                db.Entry(existingGuestList).State = EntityState.Modified;
            }
            else
            {
                guestList.userId = userId;
                db.GuestLists.Add(guestList);
                existingGuestList = guestList;
            }

            //guestList.guests = await GuestHelper.Save(existingGuestList, userId, db);

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