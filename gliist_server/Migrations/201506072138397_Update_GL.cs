namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Update_GL : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.GuestLists", "created_on", c => c.DateTimeOffset(nullable: false, precision: 7));
            AddColumn("dbo.GuestLists", "created_by_Id", c => c.String(maxLength: 128));
            CreateIndex("dbo.GuestLists", "created_by_Id");
            AddForeignKey("dbo.GuestLists", "created_by_Id", "dbo.AspNetUsers", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.GuestLists", "created_by_Id", "dbo.AspNetUsers");
            DropIndex("dbo.GuestLists", new[] { "created_by_Id" });
            DropColumn("dbo.GuestLists", "created_by_Id");
            DropColumn("dbo.GuestLists", "created_on");
        }
    }
}
