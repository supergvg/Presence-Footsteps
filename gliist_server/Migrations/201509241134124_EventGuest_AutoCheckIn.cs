namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class EventGuest_AutoCheckIn : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.EventsGuests", "IsAutoCheckIn", c => c.Boolean(nullable: false, defaultValue: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.EventsGuests", "IsAutoCheckIn");
        }
    }
}
