using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using gliist_server.Logger;

namespace gliist_server
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            Log4NetLogger.Log("The application is started.");

            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            
            GlobalConfiguration.Configuration.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Always;
        }
    }
}