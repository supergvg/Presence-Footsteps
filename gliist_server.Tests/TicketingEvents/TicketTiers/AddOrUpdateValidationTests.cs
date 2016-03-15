using System.Web.Http.Results;
using gliist_server.Areas.Ticketing.Controllers;
using gliist_server.Areas.Ticketing.Models;
using gliist_server.DataAccess;
using gliist_server.Tests.Shared;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.TicketingEvents.TicketTiers
{
    [TestClass]
    public class AddOrUpdateValidationTests
    {
        [TestMethod]
        public void BadRequest_IfTicketTypeIsNull()
        {
            var controller = new TicketTiersController();
            var result = controller.ExecuteAction<TicketTier>(controller.Post, null);

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Ticket tier is NULL.", actual.Message);
        }

        [TestMethod]
        public void BadRequest_IfNameIsEmpty()
        {
            var controller = new TicketTiersController();
            
            var result = controller.ExecuteAction(controller.Post, new TicketTier {Name = string.Empty});
            
            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Name is required.", actual.Message);
        }

        [TestMethod]
        public void BadRequest_IfPriceIsNegative()
        {
            var controller = new TicketTiersController();

            var result = controller.ExecuteAction(controller.Post, new TicketTier { Name = "name", Price = -5});

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Price should be greater than ZERO.", actual.Message);
        }

        [TestMethod]
        public void BadRequest_IfQuantityIsNegative()
        {
            var controller = new TicketTiersController();

            var result = controller.ExecuteAction(controller.Post, new TicketTier { Name = "name", Price = 5, Quantity = -3});

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Quantity should be greater than ZERO.", actual.Message);
        }
    }
}
