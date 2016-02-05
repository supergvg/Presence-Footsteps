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
    public class AddTicketTierTests
    {
        [TestMethod]
        public void BadRequest_IfTicketTypeAlreadyExists()
        {
            var events = new List<Event>
            {
                new Event
                {
                    id = 1,
                    time = DateTime.Today.AddDays(1).AddHours(17)
                },
                
            };

            var tiers = new List<TicketTier>
            {
                new TicketTier {Id = 1, Name = "BBB", EventId = 1},
                new TicketTier {Id = 2, Name = "ZZZ", EventId = 1},
                new TicketTier {Id = 3, Name = "AAA", EventId = 1}
            };

            var ticket = new TicketTier
            {
                Name = "BBB",
                Price = 5,
                StartTime = DateTime.Today.AddDays(1).AddHours(1),
                ExpirationTime = DateTime.Today.AddDays(1).AddHours(13),
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
            Assert.AreEqual("Ticket tier with the same name already exists. Please change tier NAME and try again.", actual.Message);
            tiersMockSet.Verify(x => x.Add(ticket), Times.Never);
            mockContext.Verify(x => x.SaveChanges(), Times.Never);
        }

        [TestMethod]
        public void CreatedTicketTypeIsReturned_IfSuccess()
        {
            var tiers = new List<TicketTier>
            {
                new TicketTier {Id = 1, Name = "BBB", EventId = 1},
                new TicketTier {Id = 2, Name = "ZZZ", EventId = 1},
                new TicketTier {Id = 3, Name = "AAA", EventId = 1}
            };

            var events = new List<Event>
            {
                new Event
                {
                    id = 1,
                    time = DateTime.Today.AddDays(1).AddHours(17)
                },
                
            };

            var ticket = new TicketTier
            {
                Name = "CCC",
                Price = 5,
                Quantity = 3,
                StartTime = DateTime.Today.AddDays(1).AddHours(1),
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

            var actual = result as OkNegotiatedContentResult<TicketTierViewModel>;

            Assert.IsNotNull(actual);
            tiersMockSet.Verify(m => m.Add(ticket), Times.Once);
            mockContext.Verify(x => x.SaveChanges(), Times.AtLeastOnce);
        }
    }
}
