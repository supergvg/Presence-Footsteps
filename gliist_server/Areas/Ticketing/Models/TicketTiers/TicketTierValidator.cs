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

            return null;
        }

        public static string GetFirstError(ModelStateDictionary modelState)
        {
            var error = modelState.Values
                .SelectMany(v => v.Errors).FirstOrDefault();

            return error == null ? string.Empty : error.ErrorMessage;
        }
    }
}