using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.TicketingEvents.TicketType
{
    [TestClass]
    public class AddTicketTypeTests
    {
        [TestMethod]
        public void BadRequest_IfTicketTypeAlreadyExists()
        {
            Assert.Inconclusive();
        }

        [TestMethod]
        public void BadRequest_IfExpirationDatesOverlap()
        {
            Assert.Inconclusive();
        }
        [TestMethod]
        public void CreatedTicketTypeIsReturned_IfSuccess()
        {
            Assert.Inconclusive();
        }
    }
}
