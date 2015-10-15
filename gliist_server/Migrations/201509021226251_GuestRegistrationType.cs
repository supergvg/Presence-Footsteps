namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class GuestRegistrationType : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Guests", "isPublicRegistration", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Guests", "isPublicRegistration");
        }
    }
}