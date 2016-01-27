using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class EventGuestListLinkModel
    {
        [JsonProperty(PropertyName = "eventId")]
        public int EventId { get; set; }

        [JsonProperty(PropertyName = "guestListIds")]
        public int[] GuestListIds { get; set; }

        [JsonProperty(PropertyName = "instanceType")]
        public GuestListInstanceType InstanceType { get; set; }

        public EventGuestListLinkModel()
        {
        }
    }
}