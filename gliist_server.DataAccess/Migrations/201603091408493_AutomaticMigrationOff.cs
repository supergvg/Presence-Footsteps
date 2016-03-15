using System.Data.Entity.Migrations;

namespace gliist_server.DataAccess.Migrations
{
    public partial class AutomaticMigrationOff : DbMigration
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
                        FacebookPageUrl = c.String(),
                        InstagrammPageUrl = c.String(),
                        TwitterPageUrl = c.String(),
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
                        permissions = c.String(),
                        acceptedAt = c.DateTime(),
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
                        profilePictureUrl = c.String(),
                        city = c.String(),
                        bio = c.String(),
                        contactPhone = c.String(),
                        contactEmail = c.String(),
                        permissions = c.String(),
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
                "dbo.EventsGuests",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        EventId = c.Int(),
                        GuestId = c.Int(nullable: false),
                        GuestListId = c.Int(nullable: false),
                        GuestListInstanceId = c.Int(nullable: false),
                        GuestListInstanceType = c.Int(nullable: false),
                        RsvpEmailSentDate = c.DateTime(),
                        RsvpConfirmedDate = c.DateTime(),
                        InvitationEmailSentDate = c.DateTime(),
                        AdditionalGuestsRequested = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Events", t => t.EventId)
                .ForeignKey("dbo.Guests", t => t.GuestId, cascadeDelete: true)
                .Index(t => t.EventId)
                .Index(t => t.GuestId);
            
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
                        AdditionalDetails = c.String(),
                        IsRsvpCapacityLimited = c.Boolean(nullable: false),
                        IsPublished = c.Boolean(nullable: false),
                        Type = c.Int(nullable: false),
                        RsvpType = c.Int(nullable: false),
                        AdditionalGuests = c.Int(nullable: false),
                        time = c.DateTimeOffset(nullable: false, precision: 7),
                        endTime = c.DateTimeOffset(nullable: false, precision: 7),
                        RsvpEndDate = c.DateTimeOffset(precision: 7),
                        RsvpUrl = c.String(maxLength: 255),
                        TicketingUrl = c.String(maxLength: 255),
                        invitePicture = c.String(),
                        FacebookPageUrl = c.String(),
                        InstagrammPageUrl = c.String(),
                        TwitterPageUrl = c.String(),
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
                        InstanceType = c.Int(nullable: false),
                        capacity = c.Int(nullable: false),
                        published = c.Boolean(nullable: false),
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
                        time = c.DateTime(),
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
                        lastName = c.String(),
                        phoneNumber = c.String(),
                        email = c.String(),
                        plus = c.Int(nullable: false),
                        type = c.String(),
                        isPublicRegistration = c.Boolean(nullable: false),
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
                        promoter_Id = c.String(),
                        created_on = c.DateTime(nullable: false),
                        isDeleted = c.Boolean(nullable: false),
                        company_id = c.Int(),
                        created_by_Id = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Companies", t => t.company_id)
                .ForeignKey("dbo.AspNetUsers", t => t.created_by_Id)
                .Index(t => t.company_id)
                .Index(t => t.created_by_Id);
            
            CreateTable(
                "dbo.Notifications",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        message = c.String(nullable: false),
                        time = c.DateTime(nullable: false),
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
                "dbo.ResetPasswordTokens",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        created_at = c.DateTime(nullable: false),
                        user_email = c.String(),
                        token = c.String(),
                    })
                .PrimaryKey(t => t.id);
            
            CreateTable(
                "dbo.TicketTiers",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        EventId = c.Int(nullable: false),
                        PreviousId = c.Int(),
                        Name = c.String(nullable: false, maxLength: 100),
                        Price = c.Decimal(nullable: false, precision: 18, scale: 2),
                        StartTime = c.DateTimeOffset(precision: 7),
                        Quantity = c.Int(),
                        ExpirationTime = c.DateTimeOffset(precision: 7),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Events", t => t.EventId, cascadeDelete: true)
                .ForeignKey("dbo.TicketTiers", t => t.PreviousId)
                .Index(t => t.EventId)
                .Index(t => t.PreviousId);
            
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
            DropForeignKey("dbo.TicketTiers", "PreviousId", "dbo.TicketTiers");
            DropForeignKey("dbo.TicketTiers", "EventId", "dbo.Events");
            DropForeignKey("dbo.Notifications", "originator_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.Notifications", "guest_id", "dbo.Guests");
            DropForeignKey("dbo.Notifications", "gli_id", "dbo.GuestListInstances");
            DropForeignKey("dbo.Notifications", "event_id", "dbo.Events");
            DropForeignKey("dbo.Notifications", "company_id", "dbo.Companies");
            DropForeignKey("dbo.EventsGuests", "GuestId", "dbo.Guests");
            DropForeignKey("dbo.GuestListInstances", "linked_guest_list_id", "dbo.GuestLists");
            DropForeignKey("dbo.GuestListInstances", "linked_event_id", "dbo.Events");
            DropForeignKey("dbo.GuestCheckins", "guestList_id", "dbo.GuestListInstances");
            DropForeignKey("dbo.GuestCheckins", "guest_id", "dbo.Guests");
            DropForeignKey("dbo.GuestListGuests", "Guest_id", "dbo.Guests");
            DropForeignKey("dbo.GuestListGuests", "GuestList_id", "dbo.GuestLists");
            DropForeignKey("dbo.GuestLists", "created_by_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.GuestLists", "company_id", "dbo.Companies");
            DropForeignKey("dbo.Guests", "company_id", "dbo.Companies");
            DropForeignKey("dbo.EventsGuests", "EventId", "dbo.Events");
            DropForeignKey("dbo.Events", "company_id", "dbo.Companies");
            DropForeignKey("dbo.AspNetUsers", "company_id", "dbo.Companies");
            DropForeignKey("dbo.AspNetUserClaims", "User_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserRoles", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserRoles", "RoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.AspNetUserLogins", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.Invites", "Company_id", "dbo.Companies");
            DropIndex("dbo.TicketTiers", new[] { "PreviousId" });
            DropIndex("dbo.TicketTiers", new[] { "EventId" });
            DropIndex("dbo.Notifications", new[] { "originator_Id" });
            DropIndex("dbo.Notifications", new[] { "guest_id" });
            DropIndex("dbo.Notifications", new[] { "gli_id" });
            DropIndex("dbo.Notifications", new[] { "event_id" });
            DropIndex("dbo.Notifications", new[] { "company_id" });
            DropIndex("dbo.EventsGuests", new[] { "GuestId" });
            DropIndex("dbo.GuestListInstances", new[] { "linked_guest_list_id" });
            DropIndex("dbo.GuestListInstances", new[] { "linked_event_id" });
            DropIndex("dbo.GuestCheckins", new[] { "guestList_id" });
            DropIndex("dbo.GuestCheckins", new[] { "guest_id" });
            DropIndex("dbo.GuestListGuests", new[] { "Guest_id" });
            DropIndex("dbo.GuestListGuests", new[] { "GuestList_id" });
            DropIndex("dbo.GuestLists", new[] { "created_by_Id" });
            DropIndex("dbo.GuestLists", new[] { "company_id" });
            DropIndex("dbo.Guests", new[] { "company_id" });
            DropIndex("dbo.EventsGuests", new[] { "EventId" });
            DropIndex("dbo.Events", new[] { "company_id" });
            DropIndex("dbo.AspNetUsers", new[] { "company_id" });
            DropIndex("dbo.AspNetUserClaims", new[] { "User_Id" });
            DropIndex("dbo.AspNetUserRoles", new[] { "UserId" });
            DropIndex("dbo.AspNetUserRoles", new[] { "RoleId" });
            DropIndex("dbo.AspNetUserLogins", new[] { "UserId" });
            DropIndex("dbo.Invites", new[] { "Company_id" });
            DropTable("dbo.GuestListGuests");
            DropTable("dbo.TicketTiers");
            DropTable("dbo.ResetPasswordTokens");
            DropTable("dbo.Notifications");
            DropTable("dbo.GuestLists");
            DropTable("dbo.Guests");
            DropTable("dbo.GuestCheckins");
            DropTable("dbo.GuestListInstances");
            DropTable("dbo.Events");
            DropTable("dbo.EventsGuests");
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
