using System;
using System.Linq;
using gliist_server.Models;

namespace gliist_server.Areas.Ticketing.Models
{
    class TicketTierExpirationValidator
    {
        public static string Run(TicketTierValidatorOptions options)
        {
            if (options.Model.ExpirationTime.HasValue)
            {
                if (options.Model.ExpirationTime < DateTime.Now)
                    return "Expiration Date is past.";

                if (LessThan3HoursBeforeEvent(options.Model, options.DbContext))
                    return "Expiration Date is incorrect.";

                var currentTier = (options.Model.Id > 0)
                    ? options.DbContext.TicketTiers.FirstOrDefault(x => x.Id == options.Model.Id)
                    : null;
                var nextTier = GetNextTier(options.Model, options.DbContext, currentTier);

                if (nextTier != null)
                {
                    if (DateOverlapsNextTier(options.Model, options.SoldTicketsOfCurrentModel, nextTier))
                        return string.Format("Sale expiration date cannot be greater than {0}.",
                            nextTier.ExpirationTime.Value.ToString("MMM dd, yyyy"));

                    if (NextTierIsStartedSelling(nextTier, options.SellingFacade))
                        return "You cannot change expiration date because next tier is started to be sold.";
                }
            }
            return null;
        }

        private static bool NextTierIsStartedSelling(TicketTier nextTier, ISellingFacade sellingFacade)
        {
            return sellingFacade.GetSoldTicketsNumber(nextTier.Id) > 0;
        }

        private static bool DateOverlapsNextTier(TicketTier model, int soldTickets, TicketTier nextTier)
        {
            if (soldTickets > 0)
            {
                return model.ExpirationTime >= nextTier.ExpirationTime;
            }

            return false;
        }

        private static TicketTier GetNextTier(TicketTier model, EventDBContext db, TicketTier currentTier)
        {
            var expirationDate = (currentTier != null) 
                ? currentTier.ExpirationTime 
                : model.ExpirationTime;

            return db.TicketTiers.OrderBy(x => x.ExpirationTime)
                .FirstOrDefault(x => x.Id != model.Id && x.ExpirationTime > expirationDate);
        }

        private static bool LessThan3HoursBeforeEvent(TicketTier tier, EventDBContext db)
        {
            var @event = db.Events.Select(x => new { x.time, x.id }).FirstOrDefault(x => x.id == tier.EventId);
            if (@event == null)
                return true;

            return (@event.time - tier.ExpirationTime.Value).TotalHours < 3;
        }
    }
}