using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using gliist_server.DataAccess;
using gliist_server.Models;

namespace gliist_server.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class CheckAccess : ActionFilterAttribute
    {
        private string allowPermissions;
        private string[] allowPermissionsSplit;
        private string deniedPermissions;
        private string[] deniedPermissionsSplit;

        public string AllowPermissions
        {
            get { return allowPermissions; }
            set
            {
                allowPermissions = value;
                allowPermissionsSplit = allowPermissions.Split(',');
            }
        }

        public string DeniedPermissions
        {
            get { return deniedPermissions; }
            set
            {
                deniedPermissions = value;
                deniedPermissionsSplit = deniedPermissions.Split(',');
            }
        }

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if ((allowPermissionsSplit == null || allowPermissionsSplit.Length == 0) && (deniedPermissionsSplit == null || deniedPermissionsSplit.Length == 0))
            {
                return;
            }

            var userIdentity = HttpContext.Current.User.Identity;

            if (userIdentity == null || !userIdentity.IsAuthenticated)
            {
                actionContext.Response = new HttpResponseMessage(HttpStatusCode.Unauthorized);
                return;
            }

            var context = new EventDBContext();
            var user = context.Users.FirstOrDefault(x => x.UserName == userIdentity.Name);

            if (user == null)
            {
                actionContext.Response = new HttpResponseMessage(HttpStatusCode.Unauthorized);
                return;
            }

            var userPermissions = user.permissions;

            if ((deniedPermissionsSplit != null && deniedPermissionsSplit.Length > 0 && deniedPermissionsSplit.Any(x => userPermissions.Contains(x))) ||
                (allowPermissionsSplit != null && allowPermissionsSplit.Length > 0 && !allowPermissionsSplit.Any(x => userPermissions.Contains(x))))
            {
                actionContext.Response = new HttpResponseMessage(HttpStatusCode.Forbidden);
            }
        }
    }
}
