using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.Models;
using Microsoft.AspNet.Identity;

namespace gliist_server.Controllers
{
    [Authorize]
    [RoutePrefix("api/Users")]
    public class UsersController : ApiController
    {
        private const string LocalLoginProvider = "Local";
        private readonly EventDBContext db;
        private UserManager<UserModel> UserManager;

        public UsersController()
            : this(new EventDBContext())
        {

        }

        //public UsersController(EventDBContext db)
        //{
        //    this.db = db;
        //}


        public UsersController(EventDBContext db)
            : this(Startup.UserManagerFactory(db))
        {
            this.db = db;
        }

        public UsersController(UserManager<UserModel> userManager)
        {
            UserManager = userManager;
            var userValidator = UserManager.UserValidator as UserValidator<UserModel>;

            if (userValidator != null)
            {
                userValidator.AllowOnlyAlphanumericUserNames = false;
            }
        }

        [Route("getUsers")]
        [AllowAnonymous]
        public IHttpActionResult GetUsers(string role)
        {
            var user = db.Users.FirstOrDefault(x => x.UserName == User.Identity.Name);

            if (string.IsNullOrEmpty(role))
            {
                return BadRequest("Role is incorrect");
            }

            var users = user != null
                ? db.Users.Where(x => x.permissions.Contains(role) && (role.Equals("admin") || x.company.id == user.company.id)).ToList()
                : db.Users.Where(x => x.permissions.Contains(role)).ToList();

            return Ok(users);
        }

        // GET: api/users/subscription
        
        public async Task<IHttpActionResult> GetSubscription()
        {
            var userId = User.Identity.GetUserId();

            var user = UserManager.FindById(userId);

            var companySubscription =
                db.CompanySubscriptions.Where(cs => cs.Company.id == user.company.id && cs.IsActive);

            if (companySubscription == null)
            {
                return NotFound();
            }


            var subscriptionDetails =
                companySubscription.Select(
                    cs => new {cs.id, cs.EndDate, cs.StartDate, cs.IsActive, cs.Subscription, companyId=cs.Company.id });

            return Ok(subscriptionDetails);
        }
    }
}
