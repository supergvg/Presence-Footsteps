namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_event_time_zone : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "utcOffset", c => c.Int(nullable: false));
            AlterColumn("dbo.Events", "endTime", c => c.DateTimeOffset(nullable: false, precision: 7));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Events", "endTime", c => c.DateTimeOffset(precision: 7));
            DropColumn("dbo.Events", "utcOffset");
        }
    }
}
