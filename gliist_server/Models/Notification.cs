using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace gliist_server.Models
{

    public class Notification
    {
        public int id { get; set; }

        public virtual GuestListInstance gli { get; set; }

        public virtual Event @event { get; set; }

        public virtual Guest guest { get; set; }

        [Required]
        public string message { get; set; }

        public virtual Company company { get; set; }

        public virtual UserModel originator { get; set; }

        public DateTimeOffset time { get; private set; }

        public Notification()
        {
            time = DateTimeOffset.Now;
        }
    }
}