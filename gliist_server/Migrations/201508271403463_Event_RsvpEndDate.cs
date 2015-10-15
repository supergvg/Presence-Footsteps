namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Event_RsvpEndDate : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "RsvpEndDate", c => c.DateTimeOffset(nullable: true, precision: 7));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Events", "RsvpEndDate");
        }
    }
}
