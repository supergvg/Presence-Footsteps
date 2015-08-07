namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;

    public partial class profilePicUrl : DbMigration
    {
        public override void Up()
        {
            //AddColumn("dbo.AspNetUsers", "profilePictureUrl", c => c.String());
        }

        public override void Down()
        {
           // DropColumn("dbo.AspNetUsers", "profilePictureUrl");

        }
    }
}
