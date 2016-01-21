using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.TicketingEvents.TicketType
{
    [TestClass]
    public class DeleteTycketTypeTests
    {
        [TestMethod]
        public void BadRequest_IfTycketTypeDoesNotExists()
        {
            Assert.Inconclusive();
        }
        [TestMethod]
        public void BadRequest_IfTycketTypeHasSoldTickets()
        {
            Assert.Inconclusive();
        }
        [TestMethod]
        public void OkStatusIsReturned_IfSuccess()
        {
            Assert.Inconclusive();
        }
    }
}
