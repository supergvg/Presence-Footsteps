using System.Linq;
using System.Web.Http.ModelBinding;
using gliist_server.Models;

namespace gliist_server.Areas.Ticketing.Models
{
    static class TicketTierValidator
    {
        public static string Run(TicketTierValidatorOptions options)
        {
            if (!options.ModelState.IsValid)
                return GetFirstError(options.ModelState);

            if (NameAlreadyExists(options.Model, options.DbContext))
                return "Ticket tier with the same name already exists. Please change tier NAME and try again.";

            if(ExpiratioDateAlreadyExists(options.Model, options.DbContext))
                return "Ticket tier with the same expiration date already exists. Please change EXPIRATION DATE and try again.";

            if (options.Model.Id > 0 && options.Model.Quantity < options.SoldTicketsOfCurrentModel)
                return string.Format("There are already {0} tickets sold. Please specify this or greater value and try again.", options.SoldTicketsOfCurrentModel);

            return TicketTierExpirationValidator.Run(options);
        }

        private static bool NameAlreadyExists(TicketTier model, EventDBContext db)
        {
            var tier = db.TicketTiers.FirstOrDefault(x => x.Id != model.Id && x.Name == model.Name && x.EventId == model.EventId);

            return tier != null;
        }

        private static bool ExpiratioDateAlreadyExists(TicketTier model, EventDBContext db)
        {
            var tier = db.TicketTiers.FirstOrDefault(x => x.Id != model.Id && x.ExpirationTime == model.ExpirationTime && x.EventId == model.EventId);

            return tier != null;
        }

        public static string GetFirstError(ModelStateDictionary modelState)
        {
            var error = modelState.Values
                .SelectMany(v => v.Errors).FirstOrDefault();

            return error == null ? string.Empty : error.ErrorMessage;
        }
    }
}