using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace gliist_server.Models
{
    public static class GuestHelper
    {
        public async static Task<List<Guest>> Save(GuestList guestList, string userId, EventDBContext db)
        {
            List<Guest> retVal = new List<Guest>();
            foreach (var guest in guestList.guests)
            {
                if (guest.id > 0)
                {
                    var attached = db.Guests.Attach(guest);
                    retVal.Add(attached);
                    if (attached.userId != userId)
                    {
                        throw new UnauthorizedAccessException("User trying to get access to differnt tenant guest");
                    }
                }
                else
                {
                    var existing = await db.Guests.SingleOrDefaultAsync(g => g.userId == userId && g.email == guest.email);

                    if (existing == null)
                    {
                        db.Guests.Add(guest);
                        guest.userId = userId;
                        retVal.Add(guest);

                    }
                    else
                    {
                        db.Guests.Attach(existing);
                        retVal.Add(existing);
                    }

                }

            }
            return retVal;
        }
    }

    public class Guest
    {
        public string userId { get; set; }

        public virtual List<Event> linked_events { get; set; }

        public virtual List<GuestList> linked_guest_lists { get; set; }

        public int id { get; set; }
        [Required]
        public string firstName { get; set; }
        [Required]
        public string lastName { get; set; }

        public string phoneNumber { get; set; }

        [Required]
        public string email { get; set; }
    }
}