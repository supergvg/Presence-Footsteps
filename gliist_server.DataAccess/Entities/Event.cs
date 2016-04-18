﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Configuration;
using Newtonsoft.Json;

namespace gliist_server.DataAccess
{
    public class Event
    {
        private static readonly string DefaultImageUrl = ConfigurationManager.AppSettings["defaultEventImage"];

        [JsonIgnore]
        public virtual Company company { get; set; }

        [JsonIgnore]
        public bool isDeleted { get; set; }

        public int id { get; set; }
        [Required]
        public string title { get; set; }

        public string category { get; set; }

        public string description { get; set; }

        public string location { get; set; }

        public int capacity { get; set; }

        [JsonProperty(PropertyName = "additionalDetails")]
        public string AdditionalDetails { get; set; }

        [JsonProperty(PropertyName = "isRsvpCapacityLimited")]
        public bool IsRsvpCapacityLimited { get; set; }

        [JsonProperty(PropertyName = "isPublished")]
        public bool IsPublished { get; set; }

        [Required]
        [JsonProperty(PropertyName = "type")]
        public EventType Type { get; set; }

        [Required]
        [JsonProperty(PropertyName = "rsvpType")]
        public RsvpType RsvpType { get; set; }

        [JsonProperty(PropertyName = "additionalGuests")]
        public int AdditionalGuests { get; set; }

        public DateTimeOffset time { get; set; }

        public DateTimeOffset endTime { get; set; }

        [JsonProperty(PropertyName = "rsvpEndDate")]
        public DateTimeOffset? RsvpEndDate { get; set; }

        [MaxLength(255)]
        [JsonProperty(PropertyName = "rsvpUrl")]
        public string RsvpUrl { get; set; }

        [MaxLength(255)]
        [JsonProperty(PropertyName = "ticketingUrl")]
        public string TicketingUrl { get; set; }

        [JsonIgnore]
        public virtual List<EventGuestStatus> EventGuestStatuses { get; set; }

        public virtual List<GuestListInstance> guestLists { get; set; }

        public string invitePicture { get; set; }

        [JsonProperty(PropertyName = "facebookPageUrl")]
        public string FacebookPageUrl { get; set; }

        [JsonProperty(PropertyName = "instagrammPageUrl")]
        public string InstagrammPageUrl { get; set; }

        [JsonProperty(PropertyName = "twitterPageUrl")]
        public string TwitterPageUrl { get; set; }

        [JsonProperty(PropertyName = "isRsvpExpired")]
        public bool IsRsvpExpired
        {
            get
            {
                if (RsvpEndDate == null)
                    return false;

                return (DateTime.UtcNow > RsvpEndDate.Value.UtcDateTime);
            }
        }

        [NotMapped]
        public bool GuestListsHaveAdditionalGuests { get; set; }

        [NotMapped]
        public bool NeedToUpdateEventsGuests { get; set; }

        public int PublicVisitors { get; set; }

        public Event()
        {
            invitePicture = DefaultImageUrl;
        }
    }
}