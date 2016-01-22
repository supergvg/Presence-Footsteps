using System.Web.Http.Results;
using gliist_server.Areas.Ticketing.Controllers;
using gliist_server.Tests.Shared;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.TicketingEvents.TicketTypes
{
    [TestClass]
    public class AddOrUpdateValidationTests
    {
        [TestMethod]
        public void BadRequest_IfTicketTypeIsNull()
        {
            var controller = new TicketTypesController();
            var result = controller.ExecuteAction<Areas.Ticketing.Models.TicketType>(controller.Post, null);

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Wrong ticket type.", actual.Message);
        }

        [TestMethod]
        public void BadRequest_IfNameIsEmpty()
        {
            var controller = new TicketTypesController();
            
            var result = controller.ExecuteAction(controller.Post, new Areas.Ticketing.Models.TicketType {Name = string.Empty});
            
            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Name is required.", actual.Message);
        }

        [TestMethod]
        public void BadRequest_IfPriceIsNegative()
        {
            Assert.Inconclusive();
        }

        [TestMethod]
        public void BadRequest_IfQuantityIsNegative()
        {
            Assert.Inconclusive();
        }

        [TestMethod]
        public void BadRequest_IfExpirationDateIsPast()
        {
            Assert.Inconclusive();
        }

        [TestMethod]
        public void BadRequest_IfExpirationDateIsLaterThan3HoursBeforeEvent()
        {
            Assert.Inconclusive();
        }
    }
}
