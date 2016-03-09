using System;
using Newtonsoft.Json;

namespace gliist_server.Areas.Ticketing.Models
{
    public class TicketTierViewModel
    {
        [JsonProperty("id")]
        public int Id { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("price")]
        public decimal Price { get; set; }
        [JsonProperty("previousId")]
        public int? PreviousId { get; set; }
        [JsonProperty("startTime")]
        public DateTimeOffset? StartTime { get; set; }
        [JsonProperty("quantity")]
        public int? Quantity { get; set; }
        [JsonProperty("expirationTime")]
        public DateTimeOffset? ExpirationTime { get; set; }
        [JsonProperty("soldTicketsCount")]
        public int SoldTicketsCount { get; set; }
    }
}