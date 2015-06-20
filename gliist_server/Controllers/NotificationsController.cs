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
    public class NotificationsController : ApiController
    {
        private EventDBContext db = new EventDBContext();
        private UserManager<UserModel> UserManager;

        // GET: api/Notifications
        public IQueryable<Notification> GetNotifications()
        {
            var userId = User.Identity.GetUserId();

            var user = UserManager.FindById(userId);

            return db.Notifications.Where(n => n.company.id == user.company.id).OrderByDescending(n => n.time);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        public NotificationsController()
        {
            UserManager = Startup.UserManagerFactory(db);
        }


        private bool NotificationExists(int id)
        {
            return db.Notifications.Count(e => e.id == id) > 0;
        }
    }
}