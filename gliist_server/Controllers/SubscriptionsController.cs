using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Microsoft.AspNet.Identity;
using gliist_server.Attributes;
using gliist_server.Helpers;
using gliist_server.Models;
using gliist_server.Shared;

namespace gliist_server.Controllers
{
    [RoutePrefix("api/Subscriptions")]

    [Authorize]
    public class SubscriptionsController : ApiController
    {
        private UserManager<UserModel> UserManager;
        private EventDBContext db;


        public SubscriptionsController()
            : this(new EventDBContext())
        {
        }

        public SubscriptionsController(EventDBContext db)
            : this(Startup.UserManagerFactory(db))
        {
            this.db = db;
        }

        public SubscriptionsController(UserManager<UserModel> userManager)
        {
            UserManager = userManager;
            var userValidator = UserManager.UserValidator as UserValidator<UserModel>;

            if (userValidator != null)
            {
                userValidator.AllowOnlyAlphanumericUserNames = false;
            }
        }
      
        //Get list of all Subscripitions
        // GET: api/Subscriptios
        public IQueryable<Subscription> GetSubscriptions()
        {
            return db.Subscriptions;
        }

        // GET: api/Subscriptions/5
        [ResponseType(typeof(Subscription))]
        public async Task<IHttpActionResult> GetSubscription(int id)
        {
            var subscription = await db.Subscriptions.FindAsync(id);
            if (subscription == null)
            {
                return NotFound();
            }

            return Ok(subscription);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

       
    }
}