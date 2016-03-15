using System.Data.Entity.Migrations;

namespace gliist_server.DataAccess.Migrations
{
    public partial class PublicVisitors : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "PublicVisitors", c => c.Int(false, defaultValue:0));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Events", "PublicVisitors");
        }
    }
}
