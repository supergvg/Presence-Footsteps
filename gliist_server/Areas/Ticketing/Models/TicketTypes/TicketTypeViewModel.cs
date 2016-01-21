﻿using System;
using Newtonsoft.Json;

namespace gliist_server.Areas.Ticketing.Models
{
    public class TicketTypeViewModel
    {
        [JsonProperty("id")]
        public int Id { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("price")]
        public int Price { get; set; }
        [JsonProperty("quantity")]
        public int Quantity { get; set; }
        [JsonProperty("expirationDate")]
        public DateTime ExpirationDate { get; set; }
        [JsonProperty("soldTicketCount")]
        public int SoldTicketsCount { get; set; }
    }
}