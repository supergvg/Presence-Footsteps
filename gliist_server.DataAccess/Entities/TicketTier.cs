using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace gliist_server.DataAccess
{
    public class TicketTier
    {
        public int Id { get; set; }

        public int EventId { get; set; }
        [JsonIgnore]
        public Event Event { get; set; }
        
        public int? PreviousId { get; set; }
        [JsonIgnore]
        [ForeignKey("PreviousId")]
        public TicketTier Previuos { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [MaxLength(100, ErrorMessage = "Name length should be less than or equal to 100 symbols.")]
        public string Name { get; set; }

        [Range(1.0, int.MaxValue, ErrorMessage = "Price should be greater than ZERO.")]
        public decimal Price { get; set; }

        public DateTimeOffset? StartTime { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Quantity should be greater than ZERO.")]
        public int? Quantity { get; set; }

        public DateTimeOffset? ExpirationTime { get; set; }
    }
}