using System;
using System.Web.Http.Results;
using gliist_server.Areas.Ticketing.Controllers;
using gliist_server.Areas.Ticketing.Models;
using gliist_server.Tests.Shared;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.TicketingEvents.TicketTiers
{
    [TestClass]
    public class EndByValidationTests
    {
        [TestMethod]
        public void BadRequest_IfBothQuantityAndEndTimeAreNull()
        {
            var controller = new TicketTiersController();

            var result = controller.ExecuteAction(controller.Post, new TicketTier
            {
                Name = "name",
                Price = -5
            });

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("End by parameter should be specified.", actual.Message);
        }

        [TestMethod]
        public void BadRequest_IfBothQuantityAndEndTimeAreNotNull()
        {
            var controller = new TicketTiersController();

            var result = controller.ExecuteAction(controller.Post, new TicketTier
            {
                Name = "name",
                Price = -5,
                ExpirationTime = DateTime.Now.AddDays(1),
                Quantity = 15
            });

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("End by is ambiguous.", actual.Message);
        }
    }
}
