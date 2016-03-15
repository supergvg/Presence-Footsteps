using gliist_server.DataAccess;

namespace gliist_server.Models
{
    public class IdsModel
    {
        public int[] ids { get; set; }

        public int id { get; set; }

        public GuestList gl { get; set; }
    }
}
