using System.Collections.Generic;

namespace gliist_server.Models
{
    public class ManageInfoViewModel
    {
        public string LocalLoginProvider { get; set; }

        public string UserName { get; set; }

        public IEnumerable<UserLoginInfoViewModel> Logins { get; set; }

        public IEnumerable<ExternalLoginViewModel> ExternalLoginProviders { get; set; }
    }
}
