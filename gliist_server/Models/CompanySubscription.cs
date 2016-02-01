using System;
using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class CompanySubscription
    {
        public int id { get; set; }

        //--public virtual UserModel userModel { get; set; }
        [JsonProperty(PropertyName = "subscription")]
        public virtual Subscription Subscription { get; set; }
        [JsonProperty(PropertyName = "company")]
        public virtual Company Company { get; set; }
        [JsonProperty(PropertyName = "startDate")]
        public DateTime StartDate { get; set; }
        [JsonProperty(PropertyName = "endDate")]
        public DateTime? EndDate { get; set; }
        [JsonProperty(PropertyName = "isActive")]
        public bool IsActive { get; set; }
    }
}