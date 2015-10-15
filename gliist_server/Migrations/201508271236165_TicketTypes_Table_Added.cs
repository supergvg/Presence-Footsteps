namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class TicketTypes_Table_Added : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.TicketTypes",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        EventId = c.Int(nullable: false),
                        Title = c.String(),
                        Price = c.Double(nullable: false, defaultValue: 0D),
                        SortNumber = c.Int(nullable: false, defaultValue: 1),
                        EndDate = c.DateTimeOffset(nullable: false, precision: 7),
                        IsDeleted = c.Boolean(nullable: false, defaultValue: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Events", t => t.EventId, cascadeDelete: true)
                .Index(t => t.EventId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.TicketTypes", "EventId", "dbo.Events");
            DropIndex("dbo.TicketTypes", new[] { "EventId" });
            DropTable("dbo.TicketTypes");
        }
    }
}
