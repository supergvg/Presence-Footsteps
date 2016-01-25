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
            context.MapRoute(
                "Ticketing_default",
                "ticketing/{controller}/{action}/{id}",
                new {action = "Index", id = UrlParameter.Optional},
                new[] {"gliist_server.Areas.Ticketing"}
                );
        }
    }
}