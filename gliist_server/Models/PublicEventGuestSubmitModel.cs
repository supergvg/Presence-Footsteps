using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class PersonalEventGuestSubmitModel
    {
        [JsonProperty(PropertyName = "eventId")]
        public int EventId { get; set; }

        [JsonProperty(PropertyName = "guestId")]
        public int GuestId { get; set; }

        [JsonProperty(PropertyName = "additionalGuests")]
        public int AdditionalGuests { get; set; }
    }
}
