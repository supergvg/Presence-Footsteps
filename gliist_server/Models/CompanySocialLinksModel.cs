using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class CompanySocialLinksModel
    {
        [JsonProperty(PropertyName = "id")]
        public int id { get; set; }

        [JsonProperty(PropertyName = "facebookPageUrl")]
        public string FacebookPageUrl { get; set; }

        [JsonProperty(PropertyName = "instagrammPageUrl")]
        public string InstagrammPageUrl { get; set; }

        [JsonProperty(PropertyName = "twitterPageUrl")]
        public string TwitterPageUrl { get; set; }
    }
}

//{"id": 0, "facebookPageUrl": "http://", "instagrammPageUrl": "http://", "twitterPageUrl": "http://" }