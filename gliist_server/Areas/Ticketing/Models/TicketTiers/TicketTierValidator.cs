using System;
using System.Linq;
using System.Web.Http.ModelBinding;
using gliist_server.Models;

namespace gliist_server.Areas.Ticketing.Models
{
    static class TicketTierValidator
    {
        public static string Run(TicketTier model, EventDBContext db, ModelStateDictionary modelState)
        {
            if (model == null)
                return "Ticket tier is NULL.";

            if (!modelState.IsValid)
                return GetFirstError(modelState);

            if (model.ExpirationDate < DateTime.Now)
                return "Expiration Date is past.";

            if (!IsExpirationDatePossible(model, db))
                return "Expiration Date is incorrect.";

            if (NameAlreadyExists(model, db))
                return "Ticket tier with the same name already exists. Please change tier NAME and try again.";

            return ExpiratioDateAlreadyExists(model, db) 
                ? "Ticket tier with the same expiration date already exists. Please change EXPIRATION DATE and try again." 
                : null;
        }

        private static bool NameAlreadyExists(TicketTier model, EventDBContext db)
        {
            var tier = db.TicketTiers.FirstOrDefault(x => x.Id != model.Id && x.Name == model.Name && x.EventId == model.EventId);

            return tier != null;
        }

        private static bool ExpiratioDateAlreadyExists(TicketTier model, EventDBContext db)
        {
            var tier = db.TicketTiers.FirstOrDefault(x => x.Id != model.Id && x.ExpirationDate == model.ExpirationDate && x.EventId == model.EventId);

            return tier != null;
        }

        private static bool IsExpirationDatePossible(TicketTier tier, EventDBContext db)
        {
            var @event = db.Events.Select(x => new {x.time, x.id}).FirstOrDefault(x => x.id == tier.EventId);
            if (@event == null)
                return true;

            return (@event.time - tier.ExpirationDate).TotalHours >= 3;
        }

        public static string GetFirstError(ModelStateDictionary modelState)
        {
            var error = modelState.Values
                .SelectMany(v => v.Errors).FirstOrDefault();

            return error == null ? string.Empty : error.ErrorMessage;
        }
    }
}