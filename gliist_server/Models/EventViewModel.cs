using System;
using System.ComponentModel.DataAnnotations;
using gliist_server.DataAccess;
using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class EventViewModel
    {
        public int id { get; set; }

        [Required]
        public string title { get; set; }

        public string category { get; set; }

        public string description { get; set; }

        public string location { get; set; }

        public int capacity { get; set; }

        public DateTimeOffset time { get; set; }

        public DateTimeOffset endTime { get; set; }

        public EventType type { get; set; }

        public RsvpType rsvpType { get; set; }

        public int utcOffset
        {
            get { return (int) (time.Offset.TotalHours*3600); }

        }

        public string invitePicture { get; set; }

        [JsonProperty(PropertyName = "facebookPageUrl")]
        public string FacebookPageUrl { get; set; }

        [JsonProperty(PropertyName = "instagrammPageUrl")]
        public string InstagrammPageUrl { get; set; }

        [JsonProperty(PropertyName = "twitterPageUrl")]
        public string TwitterPageUrl { get; set; }

        [JsonProperty(PropertyName = "rsvpUrl")]
        public string RsvpUrl { get; set; }

        [JsonProperty(PropertyName = "ticketingUrl")]
        public string TicketingUrl { get; set; }

        public EventViewModel(Event @event)
        {
            id = @event.id;
            title = @event.title;
            category = @event.category;
            description = @event.description;
            location = @event.location;
            capacity = @event.capacity;
            time = @event.time;
            endTime = @event.endTime;
            invitePicture = @event.invitePicture;
            type = @event.Type;
            rsvpType = @event.RsvpType;
            FacebookPageUrl = @event.FacebookPageUrl;
            TwitterPageUrl = @event.TwitterPageUrl;
            InstagrammPageUrl = @event.InstagrammPageUrl;
            RsvpUrl = @event.RsvpUrl;
            TicketingUrl = @event.TicketingUrl;

        }
    }
}
