using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class Subscription
    {
        public int id { get; set; }

        [Required]
        [MaxLength(255)]
        [JsonProperty(PropertyName = "type")]
        public string Type { get; set; }
        
        //--public virtual List<UserModel> users { get; set; }
       

        public Subscription()
        {
            //--users = new List<UserModel>();
        }
       
    }
}