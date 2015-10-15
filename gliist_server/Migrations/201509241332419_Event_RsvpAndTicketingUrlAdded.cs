namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Event_RsvpAndTicketingUrlAdded : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "RsvpUrl", c => c.String(maxLength: 255));
            AddColumn("dbo.Events", "TicketingUrl", c => c.String(maxLength: 255));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Events", "TicketingUrl");
            DropColumn("dbo.Events", "RsvpUrl");
        }
    }
}
