using System.Web.Http.ModelBinding;
using gliist_server.Models;

namespace gliist_server.Areas.Ticketing.Models
{
    class TicketTierValidatorOptions
    {
        public TicketTier Model { get; set; }
        public EventDBContext DbContext { get; set; }
        public ModelStateDictionary ModelState { get; set; }
        public int SoldTickets { get; set; }
    }
}