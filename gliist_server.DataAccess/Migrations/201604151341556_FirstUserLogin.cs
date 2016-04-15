namespace gliist_server.DataAccess.Migrations
{
    using System.Data.Entity.Migrations;

    public partial class FirstUserLogin : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AspNetUsers", "IsFirstLogin", c => c.Boolean(defaultValue: false));
        }

        public override void Down()
        {
            DropColumn("dbo.AspNetUsers", "IsFirstLogin");
        }
    }
}
