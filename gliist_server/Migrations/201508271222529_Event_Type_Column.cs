namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Event_Type_Column : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "type", c => c.Int(nullable: false, defaultValue: 1));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Events", "type");
        }
    }
}
