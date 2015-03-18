using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace gliist_server.Models
{
    public class EventDBContext : DbContext
    {
        public DbSet<Event> Events { get; set; }
    }

    public class Event
    {
        public int id { get; set; }
        public string name { get; set; }
        public DateTime date { get; set; }

    }
}