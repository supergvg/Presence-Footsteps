namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Companies",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        name = c.String(nullable: false),
                        logo = c.String(),
                    })
                .PrimaryKey(t => t.id);
            
            CreateTable(
                "dbo.Invites",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        firstName = c.String(),
                        lastName = c.String(),
                        email = c.String(),
                        phoneNumber = c.String(),
                        token = c.String(),
                        acceptedAt = c.DateTimeOffset(precision: 7),
                        Company_id = c.Int(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Companies", t => t.Company_id)
                .Index(t => t.Company_id);
            
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
                        profilePicture = c.String(),
                        city = c.String(),
                        bio = c.String(),
                        Discriminator = c.String(nullable: false, maxLength: 128),
                        company_id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Companies", t => t.company_id)
                .Index(t => t.company_id);
            
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
                "dbo.AspNetRoles",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        Name = c.String(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Events",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        isDeleted = c.Boolean(nullable: false),
                        title = c.String(nullable: false),
                        category = c.String(),
                        description = c.String(),
                        location = c.String(),
                        capacity = c.Int(nullable: false),
                        time = c.DateTimeOffset(nullable: false, precision: 7),
                        endTime = c.DateTimeOffset(precision: 7),
                        invitePicture = c.String(),
                        company_id = c.Int(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Companies", t => t.company_id)
                .Index(t => t.company_id);
            
            CreateTable(
                "dbo.GuestListInstances",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        title = c.String(),
                        listType = c.String(),
                        capacity = c.Int(nullable: false),
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
                        time = c.DateTimeOffset(precision: 7),
                        status = c.String(),
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
                        firstName = c.String(nullable: false),
                        lastName = c.String(nullable: false),
                        phoneNumber = c.String(),
                        email = c.String(nullable: false),
                        plus = c.Int(nullable: false),
                        type = c.String(),
                        company_id = c.Int(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Companies", t => t.company_id)
                .Index(t => t.company_id);
            
            CreateTable(
                "dbo.GuestLists",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        listType = c.String(),
                        title = c.String(),
                        isDeleted = c.Boolean(nullable: false),
                        company_id = c.Int(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Companies", t => t.company_id)
                .Index(t => t.company_id);
            
            CreateTable(
                "dbo.Notifications",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        message = c.String(nullable: false),
                        time = c.DateTimeOffset(nullable: false, precision: 7),
                        company_id = c.Int(),
                        event_id = c.Int(),
                        gli_id = c.Int(),
                        guest_id = c.Int(),
                        originator_Id = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Companies", t => t.company_id)
                .ForeignKey("dbo.Events", t => t.event_id)
                .ForeignKey("dbo.GuestListInstances", t => t.gli_id)
                .ForeignKey("dbo.Guests", t => t.guest_id)
                .ForeignKey("dbo.AspNetUsers", t => t.originator_Id)
                .Index(t => t.company_id)
                .Index(t => t.event_id)
                .Index(t => t.gli_id)
                .Index(t => t.guest_id)
                .Index(t => t.originator_Id);
            
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
            DropForeignKey("dbo.Notifications", "originator_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.Notifications", "guest_id", "dbo.Guests");
            DropForeignKey("dbo.Notifications", "gli_id", "dbo.GuestListInstances");
            DropForeignKey("dbo.Notifications", "event_id", "dbo.Events");
            DropForeignKey("dbo.Notifications", "company_id", "dbo.Companies");
            DropForeignKey("dbo.GuestListInstances", "linked_guest_list_id", "dbo.GuestLists");
            DropForeignKey("dbo.GuestListInstances", "linked_event_id", "dbo.Events");
            DropForeignKey("dbo.GuestCheckins", "guestList_id", "dbo.GuestListInstances");
            DropForeignKey("dbo.GuestCheckins", "guest_id", "dbo.Guests");
            DropForeignKey("dbo.GuestListGuests", "Guest_id", "dbo.Guests");
            DropForeignKey("dbo.GuestListGuests", "GuestList_id", "dbo.GuestLists");
            DropForeignKey("dbo.GuestLists", "company_id", "dbo.Companies");
            DropForeignKey("dbo.Guests", "company_id", "dbo.Companies");
            DropForeignKey("dbo.Events", "company_id", "dbo.Companies");
            DropForeignKey("dbo.AspNetUsers", "company_id", "dbo.Companies");
            DropForeignKey("dbo.AspNetUserClaims", "User_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserRoles", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserRoles", "RoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.AspNetUserLogins", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.Invites", "Company_id", "dbo.Companies");
            DropIndex("dbo.Notifications", new[] { "originator_Id" });
            DropIndex("dbo.Notifications", new[] { "guest_id" });
            DropIndex("dbo.Notifications", new[] { "gli_id" });
            DropIndex("dbo.Notifications", new[] { "event_id" });
            DropIndex("dbo.Notifications", new[] { "company_id" });
            DropIndex("dbo.GuestListInstances", new[] { "linked_guest_list_id" });
            DropIndex("dbo.GuestListInstances", new[] { "linked_event_id" });
            DropIndex("dbo.GuestCheckins", new[] { "guestList_id" });
            DropIndex("dbo.GuestCheckins", new[] { "guest_id" });
            DropIndex("dbo.GuestListGuests", new[] { "Guest_id" });
            DropIndex("dbo.GuestListGuests", new[] { "GuestList_id" });
            DropIndex("dbo.GuestLists", new[] { "company_id" });
            DropIndex("dbo.Guests", new[] { "company_id" });
            DropIndex("dbo.Events", new[] { "company_id" });
            DropIndex("dbo.AspNetUsers", new[] { "company_id" });
            DropIndex("dbo.AspNetUserClaims", new[] { "User_Id" });
            DropIndex("dbo.AspNetUserRoles", new[] { "UserId" });
            DropIndex("dbo.AspNetUserRoles", new[] { "RoleId" });
            DropIndex("dbo.AspNetUserLogins", new[] { "UserId" });
            DropIndex("dbo.Invites", new[] { "Company_id" });
            DropTable("dbo.GuestListGuests");
            DropTable("dbo.Notifications");
            DropTable("dbo.GuestLists");
            DropTable("dbo.Guests");
            DropTable("dbo.GuestCheckins");
            DropTable("dbo.GuestListInstances");
            DropTable("dbo.Events");
            DropTable("dbo.AspNetRoles");
            DropTable("dbo.AspNetUserRoles");
            DropTable("dbo.AspNetUserLogins");
            DropTable("dbo.AspNetUserClaims");
            DropTable("dbo.AspNetUsers");
            DropTable("dbo.Invites");
            DropTable("dbo.Companies");
        }
    }
}
