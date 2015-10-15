namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class User_CompanyId : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.AspNetUsers", "company_id", "dbo.Companies");
            AddForeignKey("dbo.AspNetUsers", "company_id", "dbo.Companies", "id", cascadeDelete: false);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.AspNetUsers", "company_id", "dbo.Companies");
            AddForeignKey("dbo.AspNetUsers", "company_id", "dbo.Companies", "id");
        }
    }
}
