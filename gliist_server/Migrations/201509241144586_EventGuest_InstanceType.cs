namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class EventGuest_InstanceType : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.EventsGuests", "GuestListInstanceType", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.EventsGuests", "GuestListInstanceType");
        }
    }
}
