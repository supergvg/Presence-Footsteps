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
    public class EmailController : ApiController
    {
        private EventDBContext db = new EventDBContext();

        [ResponseType(typeof(void))]
        [HttpPost]
        [Route("SendEmail")]
        public async Task<IHttpActionResult> SendEmail()
        {
            EmailHelper.SendEmail("erank3@gmail.com");
            EmailHelper.SendEmail("bisousjocelyn@gmail.com");



            return StatusCode(HttpStatusCode.Accepted);
        }
    }
}