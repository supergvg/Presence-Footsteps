using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using gliist_server.Models;

namespace gliist_server.Shared
{
    public static class Common
    {
        public static class Events
        {
            public static bool IsEventEnded(Event evnt)
            {
                return DateTime.UtcNow > evnt.endTime.UtcDateTime;
            }

            public static bool IsRsvpExpired(Event evnt)
            {
                if (evnt.RsvpEndDate == null)
                    return false;
                else
                    return DateTime.UtcNow > evnt.RsvpEndDate.Value;
            }
        }
    }
}
