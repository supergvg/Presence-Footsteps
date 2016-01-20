using System;
using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class TicketType
    {
        [JsonProperty(PropertyName = "id")]
        public int Id { get; set; }

        [JsonIgnore]
        public int EventId { get; set; }

        [JsonProperty(PropertyName = "title")]
        public string Title { get; set; }

        [JsonProperty(PropertyName = "price")]
        public double Price { get; set; }

        [JsonProperty(PropertyName = "quantity")]
        public int Quantity { get; set; }

        [JsonProperty(PropertyName = "endTime")]
        public DateTimeOffset EndTime { get; set; }
    
        [JsonIgnore]
        public bool IsDeleted { get; set; }
    }
}
