namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class TicketType : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.TicketTypes", "Quantity", c => c.Int(nullable: false));
            AddColumn("dbo.TicketTypes", "EndTime", c => c.DateTimeOffset(nullable: false, precision: 7));
            DropColumn("dbo.TicketTypes", "SortNumber");
            DropColumn("dbo.TicketTypes", "EndDate");
        }
        
        public override void Down()
        {
            AddColumn("dbo.TicketTypes", "EndDate", c => c.DateTimeOffset(nullable: false, precision: 7));
            AddColumn("dbo.TicketTypes", "SortNumber", c => c.Int(nullable: false));
            DropColumn("dbo.TicketTypes", "EndTime");
            DropColumn("dbo.TicketTypes", "Quantity");
        }
    }
}
