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
using gliist_server.Helpers;


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
                existingGuestList.listType = guestList.listType;
                db.Entry(existingGuestList).State = EntityState.Modified;


                foreach (var guest in guestList.guests)
                {
                    if (guest.id > 0)
                    {
                        db.Entry(guest).State = EntityState.Modified;
                    }
                    else
                    {
                        guest.userId = userId;
                        guest.linked_guest_lists.Add(existingGuestList);
                        db.Guests.Add(guest);
                    }
                }
            }
            else
            {
                guestList.userId = userId;

                foreach (var guest in guestList.guests)
                {
                    var existing = await db.Guests.SingleOrDefaultAsync(g => g.userId == userId && g.email == guest.email);

                    if (existing != null)
                    {
                        //db.Entry(existing).State = EntityState.Modified;
                        throw new NotImplementedException();
                    }
                    else
                    {
                        guest.userId = userId;
                        guest.linked_guest_lists.Add(guestList);
                        db.Guests.Add(guest);
                    }
                }

                db.GuestLists.Add(guestList);
            }

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