namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class PublicVisitors : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "PublicVisitors", c => c.Int(nullable: false, defaultValue: 0));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Events", "PublicVisitors");
        }
    }
}
