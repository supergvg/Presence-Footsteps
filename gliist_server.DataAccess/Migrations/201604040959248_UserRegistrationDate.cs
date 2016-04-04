namespace gliist_server.DataAccess.Migrations
{
    using System.Data.Entity.Migrations;

    public partial class UserRegistrationDate : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AspNetUsers", "Registered", c => c.DateTime(nullable: true));
        }

        public override void Down()
        {
            DropColumn("dbo.AspNetUsers", "Registered");
        }
    }
}