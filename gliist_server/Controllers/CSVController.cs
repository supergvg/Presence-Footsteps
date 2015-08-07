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
    [RoutePrefix("api/CSVController")]
    [Authorize]
    public class CSVController : ApiController
    {
        private EventDBContext db = new EventDBContext();
        private UserManager<UserModel> UserManager;


        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("CsvToGuestList")]
        public async Task<GuestList> PostCsvToGuestList()
        {
            var userId = User.Identity.GetUserId();
            var user = await UserManager.FindByIdAsync(userId);

            var gl = await FileUploadHelper.ParseCSV(this.Request, user, user.company, db);

            gl.company = user.company;

            foreach (var guest in gl.guests)
            {
                guest.company = user.company;
                guest.linked_guest_lists.Add(gl);
                db.Guests.Add(guest);
                //remove this code
                /* var existing = await db.Guests.SingleOrDefaultAsync(g => g.userId == userId && g.email == guest.email);

                 if (existing != null)
                 { 
                     continue;
                 }
                 else
                 {
                     guest.userId = userId;
                     guest.linked_guest_lists.Add(gl);
                     db.Guests.Add(guest);
                 }*/
            }

            db.GuestLists.Add(gl);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return gl;
        }


        public CSVController()
        {
            UserManager = Startup.UserManagerFactory(db);
        }
    }

}