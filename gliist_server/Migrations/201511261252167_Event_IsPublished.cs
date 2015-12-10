namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Event_IsPublished : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "IsPublished", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Events", "IsPublished");
        }
    }
}
