namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Events",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        userId = c.String(),
                        title = c.String(nullable: false),
                        description = c.String(),
                        date = c.DateTime(nullable: false),
                        time = c.DateTime(nullable: false),
                        Guest_id = c.Int(),
                        guestList_id = c.Int(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Guests", t => t.Guest_id)
                .ForeignKey("dbo.GuestLists", t => t.guestList_id)
                .Index(t => t.Guest_id)
                .Index(t => t.guestList_id);
            
            CreateTable(
                "dbo.GuestLists",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        userId = c.String(),
                        listType = c.String(),
                        title = c.String(),
                    })
                .PrimaryKey(t => t.id);
            
            CreateTable(
                "dbo.Guests",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        userId = c.String(),
                        firstName = c.String(nullable: false),
                        lastName = c.String(nullable: false),
                        phoneNumber = c.String(),
                        email = c.String(nullable: false),
                    })
                .PrimaryKey(t => t.id);
            
            CreateTable(
                "dbo.GuestGuestLists",
                c => new
                    {
                        Guest_id = c.Int(nullable: false),
                        GuestList_id = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.Guest_id, t.GuestList_id })
                .ForeignKey("dbo.Guests", t => t.Guest_id, cascadeDelete: true)
                .ForeignKey("dbo.GuestLists", t => t.GuestList_id, cascadeDelete: true)
                .Index(t => t.Guest_id)
                .Index(t => t.GuestList_id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Events", "guestList_id", "dbo.GuestLists");
            DropForeignKey("dbo.GuestGuestLists", "GuestList_id", "dbo.GuestLists");
            DropForeignKey("dbo.GuestGuestLists", "Guest_id", "dbo.Guests");
            DropForeignKey("dbo.Events", "Guest_id", "dbo.Guests");
            DropIndex("dbo.Events", new[] { "guestList_id" });
            DropIndex("dbo.GuestGuestLists", new[] { "GuestList_id" });
            DropIndex("dbo.GuestGuestLists", new[] { "Guest_id" });
            DropIndex("dbo.Events", new[] { "Guest_id" });
            DropTable("dbo.GuestGuestLists");
            DropTable("dbo.Guests");
            DropTable("dbo.GuestLists");
            DropTable("dbo.Events");
        }
    }
}
