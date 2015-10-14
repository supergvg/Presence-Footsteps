using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
