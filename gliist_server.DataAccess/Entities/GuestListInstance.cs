using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace gliist_server.DataAccess
{
    public class GuestListInstance
    {
        public int id { get; set; }

        public string title { get; set; }

        public string listType { get; set; }

        [JsonProperty(PropertyName = "instanceType")]
        public GuestListInstanceType InstanceType { get; set; }

        public int capacity { get; set; }

        public bool published { get; set; }

        [JsonIgnore]
        public virtual Event linked_event { get; set; }

        [JsonIgnore]
        public virtual GuestList linked_guest_list { get; set; }

        [JsonProperty(PropertyName = "guestsCount")]
        [NotMapped]
        public int GuestsCount { get; set; }

        public virtual List<GuestCheckin> actual { get; set; }

        public override bool Equals(object obj)
        {
            var gli = obj as GuestListInstance;

            if (gli == null)
            {
                return false;
            }

            if (this.id != 0)
            {
                return this.id == gli.id;
            }

            return base.Equals(obj);
        }

        public override int GetHashCode()
        {
            return this.id;
        }

    }
}