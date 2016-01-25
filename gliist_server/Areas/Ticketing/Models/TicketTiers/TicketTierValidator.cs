using System;
using System.Linq;
using System.Web.Http.ModelBinding;
using gliist_server.Models;

namespace gliist_server.Areas.Ticketing.Models
{
    internal static class TicketTierValidator
    {
        public static string Run(TicketTier model, EventDBContext db, ModelStateDictionary modelState)
        {
            if (model == null)
                return "Ticket tier is NULL.";

            if (!modelState.IsValid)
                return GetFirstError(modelState);

            if (model.ExpirationDate < DateTime.Now)
                return "Expiration Date is past.";

            return !IsExpirationDatePossible(model, db)
                ? "Expiration Date is incorrect."
                : null;
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