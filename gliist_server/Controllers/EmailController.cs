using System;
using System.Collections.Generic;
using System.Configuration;
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
        private EventDBContext _db = new EventDBContext();
        private UserManager<UserModel> UserManager;



        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("SendRecoverPasswordEmail")]
        [AllowAnonymous]
        public async Task<IHttpActionResult> SendRecoverPasswordEmail(string userEmail)
        {

            var existingUser = _db.Users.FirstOrDefault(u => userEmail == u.UserName);

            if (existingUser == null)
            {
                return Ok();
            }

            ResetPasswordToken token = new ResetPasswordToken()
            {
                token = Guid.NewGuid().ToString(),
                user_email = userEmail
            };

            var url = string.Format("{0}/#/reset_password/{1}", Config.AppBaseUrl, token.token);

            EmailHelper.SendRecoverPassword(userEmail, url, existingUser.company.name);

            _db.PasswordTokens.Add(token);

            await _db.SaveChangesAsync();

            return Ok();
        }




        public EmailController()
        {
            UserManager = Startup.UserManagerFactory(_db);
        }
    }
}