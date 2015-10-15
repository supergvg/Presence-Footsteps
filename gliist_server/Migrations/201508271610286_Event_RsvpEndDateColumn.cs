namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Event_RsvpEndDateColumn : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Events", "RsvpEndDate", c => c.DateTimeOffset(precision: 7));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Events", "RsvpEndDate", c => c.DateTimeOffset(nullable: false, precision: 7));
        }
    }
}
