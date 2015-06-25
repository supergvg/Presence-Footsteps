namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_reset_password_tokens : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.ResetPasswordTokens",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        created_at = c.DateTimeOffset(nullable: false, precision: 7),
                        token = c.String(),
                    })
                .PrimaryKey(t => t.id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.ResetPasswordTokens");
        }
    }
}
