using Microsoft.AspNet.Identity.EntityFramework;
using System.Data.Entity;
using gliist_server.Areas.Ticketing.Models;
using gliist_server.Migrations;

namespace gliist_server.Models
{
    public class EventDBContext : IdentityDbContext<UserModel>
    {
        // You can add custom code to this file. Changes will not be overwritten.
        // 
        // If you want Entity Framework to drop and regenerate your database
        // automatically whenever you change your model schema, please use data migrations.
        // For more information refer to the documentation:
        // http://msdn.microsoft.com/en-us/data/jj591621.aspx

        public EventDBContext()
            : base("name=EventDBContext")
        {
            Database.SetInitializer(new MigrateDatabaseToLatestVersion<EventDBContext, Configuration>());
        }

        public DbSet<Event> Events { get; set; }

        public DbSet<Guest> Guests { get; set; }

        public DbSet<GuestList> GuestLists { get; set; }

        public DbSet<GuestListInstance> GuestListInstances { get; set; }

        public DbSet<Company> Companies { get; set; }

        public DbSet<Notification> Notifications { get; set; }

        public DbSet<ResetPasswordToken> PasswordTokens { get; set; }

        public DbSet<EventGuestStatus> EventGuests { get; set; }
        public DbSet<TicketType> TicketTypes { get; set; }
    }
}
