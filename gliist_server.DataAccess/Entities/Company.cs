using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using Newtonsoft.Json;

namespace gliist_server.Models
{
    public class Company
    {
        private static string defaultImageUrl = ConfigurationManager.AppSettings["defaultCompanyImage"];

        public int id { get; set; }

        [Required]
        public string name { get; set; }

        public string logo { get; set; }

        [JsonProperty(PropertyName = "facebookPageUrl")]
        public string FacebookPageUrl { get; set; }

        [JsonProperty(PropertyName = "instagrammPageUrl")]
        public string InstagrammPageUrl { get; set; }

        [JsonProperty(PropertyName = "twitterPageUrl")]
        public string TwitterPageUrl { get; set; } 

        public virtual List<UserModel> users { get; set; }

        public virtual List<Invite> invitations { get; set; }

        public static string DefaultImageUrl {
            get { return defaultImageUrl; }
        }

        public Company()
        {
            users = new List<UserModel>();
            invitations = new List<Invite>();
            logo = defaultImageUrl;
            name = " ";
        }


        public override int GetHashCode()
        {
            return id;
        }

        public override bool Equals(object obj)
        {
            var company = obj as Company;

            if (company == null)
            {
                return false;
            }

            return company.id == this.id;
        }
    }
}