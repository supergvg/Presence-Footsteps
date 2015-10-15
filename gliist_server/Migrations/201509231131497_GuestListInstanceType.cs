namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class GuestListInstanceType : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.GuestListInstances", "InstanceType", c => c.Int(nullable: false, defaultValue: 1));
        }
        
        public override void Down()
        {
            DropColumn("dbo.GuestListInstances", "InstanceType");
        }
    }
}
