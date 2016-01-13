namespace gliist_server.Migrations
{
    using System.Data.Entity.Migrations;
    
    public partial class GuestList_PromoterId : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.GuestLists", "promoter_Id", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.GuestLists", "promoter_Id");
        }
    }
}
