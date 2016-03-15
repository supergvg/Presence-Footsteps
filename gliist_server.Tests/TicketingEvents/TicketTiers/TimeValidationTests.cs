using System;
using System.Collections.Generic;
using System.Web.Http.Results;
using gliist_server.Areas.Ticketing.Controllers;
using gliist_server.Areas.Ticketing.Models;
using gliist_server.DataAccess;
using gliist_server.Models;
using gliist_server.Tests.Shared;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace gliist_server.Tests.TicketingEvents.TicketTiers
{
    [TestClass]
    public class TimeValidationTests
    {
        [TestMethod]
        public void BadRequest_IfExpirationTimeIsLessThanStartTime()
        {
            var currentTime = DateTimeOffset.Now.AddDays(1);
            var ticket = new TicketTier
            {
                Name = "name",
                Price = 5,
                StartTime = currentTime.AddDays(10),
                ExpirationTime = currentTime.AddDays(1)
            };

            var controller = new TicketTiersController();
            var result = controller.ExecuteAction(controller.Post, ticket);

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Expiration Time is less than Start Time.", actual.Message);
        }

        [TestMethod]
        public void BadRequest_IfStartTimeIsLaterThan3HoursBeforeEvent()
        {
            var currentTime = DateTimeOffset.Now.AddDays(1);

            var data = new List<Event>
            {
                new Event
                {
                    id = 1,
                    time = currentTime.AddHours(17)
                }
            };

            var ticket = new TicketTier
            {
                Name = "name",
                Price = 5,
                Quantity = 3,
                StartTime = currentTime.AddHours(16),
                EventId = 1
            };

            var mockContext = new Mock<EventDBContext>();
            var eventMockSet = MoqHelper.CreateDbSet(data);
            var ticketTierMockSet = MoqHelper.CreateDbSet(new TicketTier[] { });
            mockContext.Setup(x => x.Events).Returns(eventMockSet.Object);
            mockContext.Setup(x => x.TicketTiers).Returns(ticketTierMockSet.Object);
            var sellingFacade = new Mock<ISellingFacade>();
            sellingFacade.Setup(x => x.GetSoldTicketsNumber(It.IsAny<int>())).Returns(0);

            var controller = new TicketTiersController(mockContext.Object, sellingFacade.Object);
            var result = controller.ExecuteAction(controller.Post, ticket);

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Start Time is incorrect.", actual.Message);
            ticketTierMockSet.Verify(x => x.Add(ticket), Times.Never);
        }

        [TestMethod]
        public void BadRequest_IfExpirationDateIsLaterThan3HoursBeforeEvent()
        {
            var currentTime = DateTimeOffset.Now.AddDays(1);

            var data = new List<Event>
            {
                new Event
                {
                    id = 1,
                    time = currentTime.AddHours(17)
                }
            };

            var ticket = new TicketTier
            {
                Name = "name",
                Price = 5,
                StartTime = currentTime,
                ExpirationTime = currentTime.AddHours(16),
                EventId = 1
            };

            var mockContext = new Mock<EventDBContext>();
            var eventMockSet = MoqHelper.CreateDbSet(data);
            var ticketTierMockSet = MoqHelper.CreateDbSet(new TicketTier[] { });
            mockContext.Setup(x => x.Events).Returns(eventMockSet.Object);
            mockContext.Setup(x => x.TicketTiers).Returns(ticketTierMockSet.Object);
            var sellingFacade = new Mock<ISellingFacade>();
            sellingFacade.Setup(x => x.GetSoldTicketsNumber(It.IsAny<int>())).Returns(0);

            var controller = new TicketTiersController(mockContext.Object, sellingFacade.Object);
            var result = controller.ExecuteAction(controller.Post, ticket);

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Expiration Time is incorrect.", actual.Message);
            ticketTierMockSet.Verify(x => x.Add(ticket), Times.Never);
        }
    }
}
