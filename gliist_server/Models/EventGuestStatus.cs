using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace gliist_server.Models
{
    [Table("EventsGuests")]
    public class EventGuestStatus
    {
        [Key]
        public int Id { get; set; }
        
        //[Index("IX_EventsGuest", 1)] 
        public int EventId { get; set; }

        [ForeignKey("EventId")]
        public virtual Event Event { get; set; }

        //[Index("IX_EventsGuest", 2)] 
        public int GuestId { get; set; }

        [ForeignKey("GuestId")]
        public virtual Guest Guest { get; set; }

        public int GuestListId { get; set; }

        public int GuestListInstanceId { get; set; }

        public GuestListInstanceType GuestListInstanceType { get; set; }

        public Nullable<DateTime> RsvpEmailSentDate { get; set; }

        public Nullable<DateTime> RsvpConfirmedDate { get; set; }

        public Nullable<DateTime> InvitationEmailSentDate { get; set; }

        public Nullable<DateTime> TicketsEmailSentDate { get; set; }

        public Nullable<DateTime> CheckInDate { get; set; }

        public bool IsAutoCheckIn { get; set; }

        public int AdditionalGuestsRequested { get; set; }

        [NotMapped]
        public bool IsRsvpEmailSent { get { return this.RsvpEmailSentDate != null; } }

        [NotMapped]
        public bool IsRsvpConfirmed { get { return this.RsvpConfirmedDate != null; } }

        [NotMapped]
        public bool IsInvitationEmailSent { get { return this.InvitationEmailSentDate != null; } }

        [NotMapped]
        public bool IsTicketsEmailSent { get { return this.TicketsEmailSentDate != null; } }

        [NotMapped]
        public bool IsCheckedIn { get { return this.CheckInDate != null; } }
    }
}
