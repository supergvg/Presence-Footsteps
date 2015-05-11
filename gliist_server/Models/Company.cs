using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace gliist_server.Models
{
    public class Company
    {
        public int id;

        [Required]
        public string name;

        public string logo;

    }
}