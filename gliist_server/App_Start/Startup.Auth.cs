using System;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin;
using Microsoft.Owin.Security.OAuth;
using Owin;
using Microsoft.Owin.Cors;
using gliist_server.Models;
using gliist_server.Providers;

namespace gliist_server
{
    public partial class Startup
    {
        static Startup()
        {
            PublicClientId = "self";

            EventDBContext eventDB = new EventDBContext();
            UserManagerFactory = (db) => new UserManager<UserModel>(new UserStore<UserModel>(db));

            OAuthOptions = new OAuthAuthorizationServerOptions
            {
                TokenEndpointPath = new PathString("/Token"),
                Provider = new ApplicationOAuthProvider(PublicClientId, UserManagerFactory, eventDB),
                AuthorizeEndpointPath = new PathString("/api/Account/ExternalLogin"),
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(14),
                AllowInsecureHttp = true
            };
        }

        public static OAuthAuthorizationServerOptions OAuthOptions { get; private set; }

        public static Func<EventDBContext, UserManager<UserModel>> UserManagerFactory { get; set; }

        public static string PublicClientId { get; private set; }

        // For more information on configuring authentication, please visit http://go.microsoft.com/fwlink/?LinkId=301864
        public void ConfigureAuth(IAppBuilder app)
        {
            // This must come first to intercept the /Token requests 
            app.UseCors(CorsOptions.AllowAll);

            app.UseOAuthAuthorizationServer(OAuthOptions);
            app.UseOAuthBearerAuthentication(new OAuthBearerAuthenticationOptions()
            {
                Provider = new QueryStringOAuthBearerProvider("authToken")
            });
        }
    }
}
