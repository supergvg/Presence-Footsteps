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
        private UserManager<UserModel> UserManager;

        // GET: api/GuestLists
        public IList<GuestListViewModel> GetGuestLists()
        {
            var userId = User.Identity.GetUserId();
            var user = UserManager.FindById(userId);

            var gls = db.GuestLists
                .Where(gl => !gl.isDeleted && gl.company.id == user.company.id && 
                    (!user.permissions.Contains("promoter") || gl.promoter_Id == userId))
                .Include(x => x.guests)
                .ToList();

            var retval = new List<GuestListViewModel>();
            foreach (var gl in gls)
            {
                retval.Add(new GuestListViewModel(gl));
            };

            return retval;
        }

        // GET: api/GuestLists/5
        [ResponseType(typeof(GuestList))]
        public async Task<IHttpActionResult> GetGuestList(int id)
        {
            var userId = User.Identity.GetUserId();
            var user = UserManager.FindById(userId);

            GuestList guestList = db.GuestLists.FirstOrDefault(gl => gl.company.id == user.company.id && gl.id == id);
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

            var userId = User.Identity.GetUserId();
            var user = UserManager.FindById(userId);

            if (user.permissions.Contains("staff"))
            {
                return BadRequest("Invalid permissions");
            }

            if (user.permissions.Contains("promoter") && guestList.created_by.UserName != user.UserName)
            {
                return BadRequest("Invalid permissions");
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
            var user = UserManager.FindById(userId);

            if (user.permissions.Contains("staff"))
            {
                return BadRequest("Invalid permissions");
            }

            if (guestList.id > 0 && !guestList.CreateCopy)
            {
                var existingGuestList = db.GuestLists.SingleOrDefault(gl => gl.company.id == user.company.id && gl.id == guestList.id);
                if (existingGuestList == null)
                {
                    throw new NotImplementedException();
                }
                existingGuestList.title = guestList.title;
                existingGuestList.listType = guestList.listType;
                existingGuestList.promoter_Id = guestList.promoter_Id;

                db.Entry(existingGuestList).State = EntityState.Modified;

                foreach (var guest in guestList.guests)
                {
                    if (guest.id > 0)
                    {
                        guest.type = guestList.listType;
                        db.Entry(guest).State = EntityState.Modified;
                    }
                    else
                    {
                        guest.company = user.company;
                        guest.type = existingGuestList.listType;
                        guest.linked_guest_lists.Add(existingGuestList);
                        guest.type = guestList.listType;
                        db.Guests.Add(guest);
                    }
                }
            }
            else
            {
                guestList.id = 0;
                guestList.title += guestList.CreateCopy ? "_Copy" : "";
                guestList.company = user.company;
                guestList.created_by = user;

                foreach (var guest in guestList.guests)
                {
                    guest.type = guestList.listType;
                    guest.type = guestList.listType;

                    guest.company = user.company;
                    guest.linked_guest_lists.Add(guestList);
                    db.Guests.Add(guest);
                    /*var existing = await db.Guests.SingleOrDefaultAsync(g => g.company.id == user.company.id && g.email == guest.email);

                    if (existing != null)
                    {
                        //db.Entry(existing).State = EntityState.Modified;
                        //throw new NotImplementedException();
                    }
                    else
                    {
                        guest.company = user.company;
                        guest.linked_guest_lists.Add(guestList);
                        db.Guests.Add(guest);
                    }*/
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
            var userId = User.Identity.GetUserId();
            var user = UserManager.FindById(userId);

            if (user.permissions.Contains("staff"))
            {
                return BadRequest("Invalid permissions");
            }

            GuestList guestList = db.GuestLists.Where(gl => gl.company.id == user.company.id && gl.id == id).FirstOrDefault();

            if (guestList == null)
            {
                return NotFound();
            }

            if (user.permissions.Contains("promoter") && guestList.created_by.UserName != user.UserName)
            {
                return BadRequest("Invalid permissions");
            }

            guestList.isDeleted = true;
            db.Entry(guestList).State = EntityState.Modified;


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

        public GuestListsController()
        {
            UserManager = Startup.UserManagerFactory(db);
        }
    }
}