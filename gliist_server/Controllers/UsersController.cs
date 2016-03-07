using System.Linq;
using System.Web.Http;
using gliist_server.Models;

namespace gliist_server.Controllers
{
    [Authorize]
    [RoutePrefix("api/Users")]
    public class UsersController : ApiController
    {
        private const string LocalLoginProvider = "Local";
        private readonly EventDBContext db;

        public UsersController()
            : this(new EventDBContext())
        {

        }

        public UsersController(EventDBContext db)
        {
            this.db = db;
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
    }
}
