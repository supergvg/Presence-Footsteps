using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.TicketingEvents.TicketTypes
{
    [TestClass]
    public class UpdateTicketTypeTests
    {
        [TestMethod]
        public void BadRequest_IfTicketTypeAlreadyExists()
        {
            Assert.Inconclusive();
        }

        [TestMethod]
        public void BadRequest_IfQuantityIsLessThanNumberOfSoldTickets()
        {
            Assert.Inconclusive();
        }

        [TestMethod]
        public void BadRequest_IfExpirationDatesOverlap()
        {
            Assert.Inconclusive();
        }

        [TestMethod]
        public void BadRequest_IfFirstTicketTypeIsExtendedButSecondTicketTypeIsStartedSelling()
        {
            Assert.Inconclusive();
        }

        [TestMethod]
        public void UpdatedTicketTypeIsReturned_IfSuccess()
        {
            Assert.Inconclusive();
        }

        [TestMethod]
        public void SoldTicketsIsUpdated_IfSuccessAndAppearedSoldTickets()
        {
            Assert.Inconclusive();
        }
    }
}
