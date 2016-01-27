using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class EventGuestCompanyModel
    {
        [JsonProperty(PropertyName = "event")]
        public Event Event { get; set; }

        [JsonProperty(PropertyName = "guest")]
        public Guest Guest { get; set; }

        [JsonProperty(PropertyName = "company")]
        public Company Company { get; set; }
        
    }
}
