namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class invite_per : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Invites", "permissions_internal", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Invites", "permissions_internal");
        }
    }
}
