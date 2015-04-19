namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class initial : DbMigration
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
                        location = c.String(),
                        capacity = c.Int(nullable: false),
                        date = c.DateTime(nullable: false),
                        time = c.DateTime(nullable: false),
                        Guest_id = c.Int(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Guests", t => t.Guest_id)
                .Index(t => t.Guest_id);
            
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
                "dbo.AspNetRoles",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        Name = c.String(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.AspNetUsers",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        UserName = c.String(),
                        PasswordHash = c.String(),
                        SecurityStamp = c.String(),
                        firstName = c.String(),
                        lastName = c.String(),
                        phoneNumber = c.String(),
                        profilePictureData = c.Binary(),
                        city = c.String(),
                        company = c.String(),
                        bio = c.String(),
                        profilePicture = c.String(),
                        Discriminator = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.AspNetUserClaims",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        ClaimType = c.String(),
                        ClaimValue = c.String(),
                        User_Id = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AspNetUsers", t => t.User_Id, cascadeDelete: true)
                .Index(t => t.User_Id);
            
            CreateTable(
                "dbo.AspNetUserLogins",
                c => new
                    {
                        UserId = c.String(nullable: false, maxLength: 128),
                        LoginProvider = c.String(nullable: false, maxLength: 128),
                        ProviderKey = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.UserId, t.LoginProvider, t.ProviderKey })
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.AspNetUserRoles",
                c => new
                    {
                        UserId = c.String(nullable: false, maxLength: 128),
                        RoleId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.UserId, t.RoleId })
                .ForeignKey("dbo.AspNetRoles", t => t.RoleId, cascadeDelete: true)
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
                .Index(t => t.RoleId)
                .Index(t => t.UserId);
            
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
            
            CreateTable(
                "dbo.GuestListEvents",
                c => new
                    {
                        GuestList_id = c.Int(nullable: false),
                        Event_id = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.GuestList_id, t.Event_id })
                .ForeignKey("dbo.GuestLists", t => t.GuestList_id, cascadeDelete: true)
                .ForeignKey("dbo.Events", t => t.Event_id, cascadeDelete: true)
                .Index(t => t.GuestList_id)
                .Index(t => t.Event_id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.AspNetUserClaims", "User_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserRoles", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserRoles", "RoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.AspNetUserLogins", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.GuestListEvents", "Event_id", "dbo.Events");
            DropForeignKey("dbo.GuestListEvents", "GuestList_id", "dbo.GuestLists");
            DropForeignKey("dbo.GuestGuestLists", "GuestList_id", "dbo.GuestLists");
            DropForeignKey("dbo.GuestGuestLists", "Guest_id", "dbo.Guests");
            DropForeignKey("dbo.Events", "Guest_id", "dbo.Guests");
            DropIndex("dbo.AspNetUserClaims", new[] { "User_Id" });
            DropIndex("dbo.AspNetUserRoles", new[] { "UserId" });
            DropIndex("dbo.AspNetUserRoles", new[] { "RoleId" });
            DropIndex("dbo.AspNetUserLogins", new[] { "UserId" });
            DropIndex("dbo.GuestListEvents", new[] { "Event_id" });
            DropIndex("dbo.GuestListEvents", new[] { "GuestList_id" });
            DropIndex("dbo.GuestGuestLists", new[] { "GuestList_id" });
            DropIndex("dbo.GuestGuestLists", new[] { "Guest_id" });
            DropIndex("dbo.Events", new[] { "Guest_id" });
            DropTable("dbo.GuestListEvents");
            DropTable("dbo.GuestGuestLists");
            DropTable("dbo.AspNetUserRoles");
            DropTable("dbo.AspNetUserLogins");
            DropTable("dbo.AspNetUserClaims");
            DropTable("dbo.AspNetUsers");
            DropTable("dbo.AspNetRoles");
            DropTable("dbo.Guests");
            DropTable("dbo.GuestLists");
            DropTable("dbo.Events");
        }
    }
}
