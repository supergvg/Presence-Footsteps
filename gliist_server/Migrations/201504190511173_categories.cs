namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class categories : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "category", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Events", "category");
        }
    }
}
