namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class EventsGuests : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.EventsGuests",
                c => new
                {
                    Id = c.Int(nullable: false, identity: true),
                    EventId = c.Int(nullable: false),
                    GuestId = c.Int(nullable: false),
                    GuestListId = c.Int(nullable: false, defaultValue: 0),
                    GuestListInstanceId = c.Int(nullable: false, defaultValue: 0),
                    RsvpEmailSentDate = c.DateTime(defaultValue: null),
                    RsvpConfirmedDate = c.DateTime(defaultValue: null),
                    InvitationEmailSentDate = c.DateTime(defaultValue: null),
                    TicketsEmailSentDate = c.DateTime(defaultValue: null),
                    CheckInDate = c.DateTime(defaultValue: null),
                    AdditionalGuestsRequested = c.Int(nullable: false, defaultValue: 0),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Events", t => t.EventId, cascadeDelete: false)
                .ForeignKey("dbo.Guests", t => t.GuestId, cascadeDelete: false);
            //.Index(t => new { t.EventId, t.GuestId }, name: "IX_EventsGuest");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.EventsGuests", "GuestId", "dbo.Guests");
            DropForeignKey("dbo.EventsGuests", "EventId", "dbo.Events");
            DropIndex("dbo.EventsGuests", "IX_EventsGuest");
            DropTable("dbo.EventsGuests");
        }
    }
}
