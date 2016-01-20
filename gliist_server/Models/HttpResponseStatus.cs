using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class HttpResponseStatus
    {
        [JsonProperty(PropertyName = "message")]
        public string Message { get; set; }

        [JsonProperty(PropertyName = "code")]
        public string Code { get; set; }
    }
}
