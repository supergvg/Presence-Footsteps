using System;
using System.Linq;
using gliist_server.Models;

namespace gliist_server.Areas.Ticketing.Models
{
    static class TicketTierValidator
    {
        public static string Run(TicketTierValidatorOptions options)
        {
            var result = ParametersValidator.Run(options);
            if (result != null)
                return result;

            if (NameAlreadyExists(options.Model, options.DbContext))
                return "Ticket tier with the same name already exists. Please change tier NAME and try again.";

            if (LessThan3HoursBeforeEvent(options.Model.EventId, options.Model.StartTime, options.DbContext))
                return "Start Time is incorrect.";

            if (options.Model.ExpirationTime.HasValue &&
                LessThan3HoursBeforeEvent(options.Model.EventId, options.Model.ExpirationTime.Value, options.DbContext))
                    return "Expiration Time is incorrect.";

            return null;
        }

        #region private methods

        

        private static bool NameAlreadyExists(TicketTier model, EventDBContext db)
        {
            var tier = db.TicketTiers.FirstOrDefault(x => x.Id != model.Id && x.Name == model.Name && x.EventId == model.EventId);

            return tier != null;
        }

       

        private static bool LessThan3HoursBeforeEvent(int eventId, DateTime time, EventDBContext db)
        {
            var @event = db.Events.Select(x => new { x.time, x.id }).FirstOrDefault(x => x.id == eventId);
            if (@event == null)
                return true;

            return (@event.time - time).TotalHours < 3;
        }

        #endregion
    }
}