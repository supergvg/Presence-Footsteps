using System.Web.Http;
using System.Web.Mvc;

namespace gliist_server.Areas.Ticketing
{
    public class TicketingAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get { return "Ticketing"; }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.Routes.MapHttpRoute(
                "Ticketing_default",
                "api/ticketing/{controller}/{id}",
                new {id = UrlParameter.Optional}
                );
        }
    }
}