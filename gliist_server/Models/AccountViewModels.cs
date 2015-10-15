using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace gliist_server.Models
{
    // Models returned by AccountController actions.

    public class UserInfoViewModel
    {
        public string userId { get; set; }

        public string UserName { get; set; }

        public string firstName { get; set; }

        public string lastName { get; set; }

        public string email { get; set; }

        [DataType(DataType.PhoneNumber)]
        public string phoneNumber { get; set; }

        public string permissions { get; set; }

        public string city { get; set; }

        public string company { get; set; }

        public string company_id { get; set; }

        public string bio { get; set; }

        public bool HasRegistered { get; set; }

        public string LoginProvider { get; set; }

        [JsonProperty(PropertyName = "facebookPageUrl")]
        public string FacebookPageUrl { get; set; }

        [JsonProperty(PropertyName = "instagrammPageUrl")]
        public string InstagrammPageUrl { get; set; }

        [JsonProperty(PropertyName = "twitterPageUrl")]
        public string TwitterPageUrl { get; set; }
    }
}
