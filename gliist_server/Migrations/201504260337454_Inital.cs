namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Inital : DbMigration
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
                        category = c.String(),
                        description = c.String(),
                        location = c.String(),
                        capacity = c.Int(nullable: false),
                        date = c.DateTime(nullable: false),
                        time = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.id);
            
            CreateTable(
                "dbo.GuestListInstances",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        linked_event_id = c.Int(),
                        linked_guest_list_id = c.Int(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Events", t => t.linked_event_id)
                .ForeignKey("dbo.GuestLists", t => t.linked_guest_list_id)
                .Index(t => t.linked_event_id)
                .Index(t => t.linked_guest_list_id);
            
            CreateTable(
                "dbo.GuestCheckins",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        time = c.DateTime(nullable: false),
                        plus = c.Int(nullable: false),
                        guest_id = c.Int(),
                        guestList_id = c.Int(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Guests", t => t.guest_id)
                .ForeignKey("dbo.GuestListInstances", t => t.guestList_id)
                .Index(t => t.guest_id)
                .Index(t => t.guestList_id);
            
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
                        plus = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.id);
            
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
                "dbo.GuestListGuests",
                c => new
                    {
                        GuestList_id = c.Int(nullable: false),
                        Guest_id = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.GuestList_id, t.Guest_id })
                .ForeignKey("dbo.GuestLists", t => t.GuestList_id, cascadeDelete: true)
                .ForeignKey("dbo.Guests", t => t.Guest_id, cascadeDelete: true)
                .Index(t => t.GuestList_id)
                .Index(t => t.Guest_id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.AspNetUserClaims", "User_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserRoles", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserRoles", "RoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.AspNetUserLogins", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.GuestListInstances", "linked_guest_list_id", "dbo.GuestLists");
            DropForeignKey("dbo.GuestListInstances", "linked_event_id", "dbo.Events");
            DropForeignKey("dbo.GuestCheckins", "guestList_id", "dbo.GuestListInstances");
            DropForeignKey("dbo.GuestCheckins", "guest_id", "dbo.Guests");
            DropForeignKey("dbo.GuestListGuests", "Guest_id", "dbo.Guests");
            DropForeignKey("dbo.GuestListGuests", "GuestList_id", "dbo.GuestLists");
            DropIndex("dbo.AspNetUserClaims", new[] { "User_Id" });
            DropIndex("dbo.AspNetUserRoles", new[] { "UserId" });
            DropIndex("dbo.AspNetUserRoles", new[] { "RoleId" });
            DropIndex("dbo.AspNetUserLogins", new[] { "UserId" });
            DropIndex("dbo.GuestListInstances", new[] { "linked_guest_list_id" });
            DropIndex("dbo.GuestListInstances", new[] { "linked_event_id" });
            DropIndex("dbo.GuestCheckins", new[] { "guestList_id" });
            DropIndex("dbo.GuestCheckins", new[] { "guest_id" });
            DropIndex("dbo.GuestListGuests", new[] { "Guest_id" });
            DropIndex("dbo.GuestListGuests", new[] { "GuestList_id" });
            DropTable("dbo.GuestListGuests");
            DropTable("dbo.AspNetUserRoles");
            DropTable("dbo.AspNetUserLogins");
            DropTable("dbo.AspNetUserClaims");
            DropTable("dbo.AspNetUsers");
            DropTable("dbo.AspNetRoles");
            DropTable("dbo.GuestLists");
            DropTable("dbo.Guests");
            DropTable("dbo.GuestCheckins");
            DropTable("dbo.GuestListInstances");
            DropTable("dbo.Events");
        }
    }
}
