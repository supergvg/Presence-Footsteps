namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class user_per : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AspNetUsers", "permissions_internal", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.AspNetUsers", "permissions_internal");
        }
    }
}
