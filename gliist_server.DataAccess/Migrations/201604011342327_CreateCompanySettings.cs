using System.Data.Entity.Migrations;

namespace gliist_server.DataAccess.Migrations
{
    public partial class CreateCompanySettings : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.CompanySettings",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        CompanyId = c.Int(nullable: false),
                        Key = c.String(maxLength: 50),
                        Value = c.String(maxLength: 255),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: false)
                .Index(t => t.CompanyId);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.CompanySettings", "CompanyId", "dbo.Companies");
            DropIndex("dbo.CompanySettings", new[] { "CompanyId" });
            DropTable("dbo.CompanySettings");
        }
    }
}
