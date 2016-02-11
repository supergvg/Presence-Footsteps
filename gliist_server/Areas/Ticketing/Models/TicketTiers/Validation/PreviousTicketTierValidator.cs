using System;
using System.Linq;

namespace gliist_server.Areas.Ticketing.Models
{
    internal class PreviousTicketTierValidator
    {
        public static string Run(TicketTierValidatorOptions options)
        {
            if (!options.Model.PreviousId.HasValue)
                throw new NullReferenceException("options.Model.PreviousId");

            var previous = options.DbContext.TicketTiers.FirstOrDefault(x => x.Id == options.Model.PreviousId.Value);
            if (previous == null)
                return "Previous ticket tier not found.";

            if (previous.PreviousId == options.Model.Id)
                return "Previous tier already uses current one as start time.";

            if (options.Model.ExpirationTime.HasValue)
            {
                if (previous.ExpirationTime.HasValue &&
                    options.Model.ExpirationTime.Value < previous.ExpirationTime.Value)
                    return "Current tier expires earlier than previous tier. Please correct it and try again.";
            }

            return null;
        }
    }
}