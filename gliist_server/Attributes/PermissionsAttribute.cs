using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using gliist_server.Models;

namespace gliist_server.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class CheckAccess : ActionFilterAttribute
    {
        private string _allowPermissions;
        private string[] _allowPermissionsSplit;
        private string _deniedPermissions;
        private string[] _deniedPermissionsSplit;

        public string AllowPermissions
        {
            get { return _allowPermissions; }
            set
            {
                _allowPermissions = value;
                _allowPermissionsSplit = _allowPermissions.Split(',');
            }
        }

        public string DeniedPermissions
        {
            get { return _deniedPermissions; }
            set
            {
                _deniedPermissions = value;
                _deniedPermissionsSplit = _deniedPermissions.Split(',');
            }
        }

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if ((_allowPermissionsSplit == null || _allowPermissionsSplit.Length == 0) && (_deniedPermissionsSplit == null || _deniedPermissionsSplit.Length == 0))
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

            if ((_deniedPermissionsSplit != null && _deniedPermissionsSplit.Length > 0 && _deniedPermissionsSplit.Any(x => userPermissions.Contains(x))) ||
                (_allowPermissionsSplit != null && _allowPermissionsSplit.Length > 0 && !_allowPermissionsSplit.Any(x => userPermissions.Contains(x))))
            {
                actionContext.Response = new HttpResponseMessage(HttpStatusCode.Forbidden);
            }
        }
    }
}
