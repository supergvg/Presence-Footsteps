namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class gli_published : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.GuestListInstances", "published", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.GuestListInstances", "published");
        }
    }
}
