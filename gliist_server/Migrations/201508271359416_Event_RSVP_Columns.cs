namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Event_RSVP_Columns : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "RsvpType", c => c.Int(nullable: false, defaultValue: 1));
            AddColumn("dbo.Events", "AdditionalGuests", c => c.Int(nullable: false, defaultValue: 0));
            AlterColumn("dbo.Events", "Type", c => c.Int(nullable: false, defaultValue: 1));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Events", "Type", c => c.Int(nullable: false, defaultValue: 1));
            DropColumn("dbo.Events", "AdditionalGuests");
            DropColumn("dbo.Events", "RsvpType");
        }
    }
}
