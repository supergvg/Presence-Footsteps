using System;
using System.Linq;
using System.Web.Http.ModelBinding;

namespace gliist_server.Areas.Ticketing.Models
{
    class ParametersValidator
    {
        public static string Run(TicketTierValidatorOptions options)
        {
            if (!options.ModelState.IsValid)
                return GetFirstError(options.ModelState);

            if (!EndByIsSpecified(options.Model))
                return "End by parameter should be specified.";

            if (EndByIsAmbiguous(options.Model))
                return "End by is ambiguous.";

            if (options.Model.StartTime < DateTime.Now)
                return "Start Time is past.";

            if (options.Model.ExpirationTime.HasValue && 
                options.Model.ExpirationTime.Value < options.Model.StartTime)
                    return "Expiration Time is less than Start Time.";

            if (options.Model.Id > 0 && options.Model.Quantity < options.SoldTickets)
                return string.Format("There are already {0} tickets sold. Please specify this or greater value and try again.", options.SoldTickets);

            return null;
        }

        #region private methods

        private static string GetFirstError(ModelStateDictionary modelState)
        {
            var error = modelState.Values
                .SelectMany(v => v.Errors).FirstOrDefault();

            return error == null ? string.Empty : error.ErrorMessage;
        }

        private static bool EndByIsSpecified(TicketTier model)
        {
            return model.Quantity.HasValue || model.ExpirationTime.HasValue;
        }

        private static bool EndByIsAmbiguous(TicketTier model)
        {
            return model.Quantity.HasValue && model.ExpirationTime.HasValue;
        }

        #endregion

    }
}