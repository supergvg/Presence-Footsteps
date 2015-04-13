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
    [RoutePrefix("api/CSVController")]
    [Authorize]
    public class CSVController : ApiController
    {
        private EventDBContext db = new EventDBContext();

        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("CsvToGuestList")]
        public async Task<IHttpActionResult> PostCsvToGuestList()
        {
            var userId = User.Identity.GetUserId();
            var gl = await FileUploadHelper.ParseCSV(this.Request, userId, db);

            await GuestHelper.Save(gl, userId, db);


            //var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

            //user.profilePictureData = profilePicImage.Item2;
            //user.profilePicture = profilePicImage.Item1;

            //_db.Entry(user).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return StatusCode(HttpStatusCode.OK);
        }
    }

}