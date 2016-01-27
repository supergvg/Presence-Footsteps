using System.Linq;
using System.Web.Http;
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

        public IQueryable<NotificationViewModel> GetNotifications()
        {
            var userId = User.Identity.GetUserId();

            var user = userManager.FindById(userId);

            return db.Notifications.Where(n => n.company.id == user.company.id).OrderByDescending(n => n.time)
                .Select(x => new NotificationViewModel
                {
                    time = x.time,
                    message = x.message,
                    guest = new GuestViewModel
                    {
                        id = x.guest.id
                    },
                    gli = new GuestListInstanceViewModel
                    {
                        id = x.gli.id
                    }
                });
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