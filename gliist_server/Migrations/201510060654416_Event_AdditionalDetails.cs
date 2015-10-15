namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;

    public partial class Event_AdditionalDetails : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "AdditionalDetails", c => c.String());
        }

        public override void Down()
        {
            DropColumn("dbo.Events", "AdditionalDetails");
        }
    }
}