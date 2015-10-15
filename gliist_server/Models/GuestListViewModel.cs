using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace gliist_server.Models
{
    public class GuestListViewModel
    {
        public int id { get; set; }

        public int total { get; private set; }

        public string listType { get; set; }

        public string title { get; set; }

        public DateTimeOffset created_on { get; set; }

        public virtual UserModel created_by { get; set; }

        public GuestListViewModel(GuestList gl)
        {
            id = gl.id;
            listType = gl.listType;
            title = gl.title;
            created_on = gl.created_on;
            created_by = gl.created_by;
            total = 0;
            foreach (var g in gl.guests)
            {
                total += 1 + g.plus;
            }
        }
    }
}
