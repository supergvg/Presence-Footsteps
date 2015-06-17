namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class update_per : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Invites", "permissions", c => c.String());
            AddColumn("dbo.AspNetUsers", "permissions", c => c.String());
            DropColumn("dbo.Invites", "permissions_internal");
            DropColumn("dbo.AspNetUsers", "permissions_internal");
        }
        
        public override void Down()
        {
            AddColumn("dbo.AspNetUsers", "permissions_internal", c => c.String());
            AddColumn("dbo.Invites", "permissions_internal", c => c.String());
            DropColumn("dbo.AspNetUsers", "permissions");
            DropColumn("dbo.Invites", "permissions");
        }
    }
}
