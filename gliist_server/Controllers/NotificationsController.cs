using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using gliist_server.DataAccess;
using Microsoft.AspNet.Identity;
using gliist_server.Models;


namespace gliist_server.Controllers
{
    public class NotificationsController : ApiController
    {
        private readonly EventDBContext db = new EventDBContext();
        private readonly UserManager<UserModel> userManager;

        public NotificationsController()
        {
            userManager = Startup.UserManagerFactory(db);
        }

        // GET: api/Notifications

        public IEnumerable<NotificationViewModel> GetNotifications()
        {
            var userId = User.Identity.GetUserId();

            var user = userManager.FindById(userId);
            var offset = TimeZoneInfo.Local.GetUtcOffset(DateTime.Now);

            var notifications = db.Notifications
                .Where(n => n.company.id == user.company.id)
                .OrderByDescending(n => n.time)
                .Select(x => new { x.time, x.message, guestId = x.guest.id, gliId = x.gli.id, eventEndTime = x.@event.endTime })
                .ToList()
                .Select(x => new NotificationViewModel
                {
                    time = new DateTimeOffset(x.time, offset),
                    eventEndTime = x.eventEndTime,
                    message = x.message,
                    guest = new GuestModel { id = x.guestId },
                    gli = new GuestListInstanceModel { id = x.gliId }
                });

            return notifications;
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