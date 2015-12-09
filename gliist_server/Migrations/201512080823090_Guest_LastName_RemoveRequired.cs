namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Guest_LastName_RemoveRequired : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Guests", "lastName", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Guests", "lastName", c => c.String(nullable: false));
        }
    }
}
