namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_guest_type : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Guests", "type", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Guests", "type");
        }
    }
}
