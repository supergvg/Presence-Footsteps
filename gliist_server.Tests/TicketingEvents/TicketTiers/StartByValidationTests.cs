using System;
using System.Collections.Generic;
using System.Web.Http.Results;
using gliist_server.Areas.Ticketing.Controllers;
using gliist_server.Areas.Ticketing.Models;
using gliist_server.Models;
using gliist_server.Tests.Shared;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace gliist_server.Tests.TicketingEvents.TicketTiers
{
    [TestClass]
    public class StartByValidationTests
    {
        [TestMethod]
        public void BadRequest_IfBothPreviousIdAndStartTimeAreNull()
        {
            var controller = new TicketTiersController();

            var result = controller.ExecuteAction(controller.Post, new TicketTier
            {
                Name = "name",
                Price = 5,
                Quantity = 6
            });

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Start by parameter should be specified.", actual.Message);
        }

        [TestMethod]
        public void BadRequest_IfBothPreviousIdAndStartTimeAreNotNull()
        {
            var controller = new TicketTiersController();

            var result = controller.ExecuteAction(controller.Post, new TicketTier
            {
                Name = "name",
                Price = 5,
                Quantity = 6,
                PreviousId = 3,
                StartTime = DateTime.Today.AddDays(1)
            });

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Start by is ambiguous.", actual.Message);
        }

        [TestMethod]
        public void BadRequest_IfPreviousDoesNotExist()
        {
            var tiers = new List<TicketTier>
            {
                new TicketTier {Id = 1, Name = "BBB", EventId = 1}
            };

            var events = new List<Event>
            {
                new Event
                {
                    id = 1,
                    time = DateTime.Today.AddDays(1).AddHours(17)
                }
            };

            var ticket = new TicketTier
            {
                Name = "CCC",
                Price = 5,
                Quantity = 3,
                PreviousId = 3,
                EventId = 1
            };

            var mockContext = new Mock<EventDBContext>();
            var tiersMockSet = MoqHelper.CreateDbSet(tiers);
            var eventsMockSet = MoqHelper.CreateDbSet(events);
            mockContext.Setup(x => x.TicketTiers).Returns(tiersMockSet.Object);
            mockContext.Setup(x => x.Events).Returns(eventsMockSet.Object);
            var sellingFacade = new Mock<ISellingFacade>();
            sellingFacade.Setup(x => x.GetSoldTicketsNumber(It.IsAny<int>())).Returns(0);

            var controller = new TicketTiersController(mockContext.Object, sellingFacade.Object);
            var result = controller.ExecuteAction(controller.Post, ticket);

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Previous ticket tier not found.", actual.Message);
        }
    }
}
