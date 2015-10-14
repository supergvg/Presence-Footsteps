using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class PublicEventGuestSubmitModel
    {
        [JsonProperty(PropertyName = "eventId")]
        public int EventId { get; set; }

        [JsonProperty(PropertyName = "email")]
        public string Email { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "additionalGuests")]
        public int AdditionalGuests { get; set; }
    }
}
