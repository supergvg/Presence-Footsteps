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
    [RoutePrefix("api/EmailController")]
    [Authorize]
    public class EmailController : ApiController
    {
        private EventDBContext db = new EventDBContext();
        private UserManager<UserModel> UserManager;

        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("SendEmail")]
        public async Task<IHttpActionResult> SendEmail()
        {
            var userId = User.Identity.GetUserId();

            UserModel user = UserManager.FindById(userId);



            EmailHelper.SendWelcomeEmail("erank3@gmail.com", "http://www.gliist.com", user.UserName, "http://www.gliist.com");
            EmailHelper.SendWelcomeEmail("bisousjocelyn@gmail.com", "http://www.gliist.com", user.UserName, "http://www.gliist.com");



            return StatusCode(HttpStatusCode.Accepted);
        }

        public EmailController()
        {
            UserManager = Startup.UserManagerFactory(db);
        }
    }
}