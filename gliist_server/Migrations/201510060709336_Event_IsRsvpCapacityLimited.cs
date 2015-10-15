namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Event_IsRsvpCapacityLimited : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "IsRsvpCapacityLimited", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Events", "IsRsvpCapacityLimited");
        }
    }
}
