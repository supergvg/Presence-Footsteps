using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace gliist_server.Models
{
    public class IdsModel
    {
        public int[] ids { get; set; }

        public int id { get; set; }

        public GuestList gl { get; set; }
    }
}
