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
    public class UpdateTicketTierTests
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
                Id = 2,
                Name = "BBB",
                Price = 5,
                StartTime = DateTime.Today.AddDays(1),
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
            mockContext.Verify(x => x.SetModified(ticket), Times.Never);
            mockContext.Verify(x => x.SaveChanges(), Times.Never);
        }

        [TestMethod]
        public void BadRequest_IfQuantityIsLessThanNumberOfSoldTickets()
        {
            var events = new List<Event>
            {
                new Event
                {
                    id = 1,
                    time = DateTime.Today.AddDays(1).AddHours(17)
                }
            };

            var tiers = new List<TicketTier>
            {
                new TicketTier {Id = 1, Name = "BBB", EventId = 1},
                new TicketTier {Id = 2, Name = "ZZZ", EventId = 1},
                new TicketTier {Id = 3, Name = "AAA", EventId = 1}
            };

            var ticket = new TicketTier
            {
                Id = 2,
                Name = "ZZZ",
                Price = 5,
                StartTime = DateTime.Today.AddDays(1),
                Quantity = 5,
                EventId = 1
            };

            var mockContext = new Mock<EventDBContext>();
            var tiersMockSet = MoqHelper.CreateDbSet(tiers);
            var eventsMockSet = MoqHelper.CreateDbSet(events);
            mockContext.Setup(x => x.TicketTiers).Returns(tiersMockSet.Object);
            mockContext.Setup(x => x.Events).Returns(eventsMockSet.Object);
            var sellingFacade = new Mock<ISellingFacade>();
            sellingFacade.Setup(x => x.GetSoldTicketsNumber(It.IsAny<int>())).Returns<int>(id => 6);

            var controller = new TicketTiersController(mockContext.Object, sellingFacade.Object);
            var result = controller.ExecuteAction(controller.Post, ticket);

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("There are already 6 tickets sold. Please specify this or greater value and try again.", actual.Message);
            mockContext.Verify(x => x.SetModified(ticket), Times.Never);
            mockContext.Verify(x => x.SaveChanges(), Times.Never);
        }
        
        [TestMethod]
        public void UpdatedTicketTypeIsReturned_IfSuccess()
        {
            var events = new List<Event>
            {
                new Event
                {
                    id = 1,
                    time = DateTime.Today.AddDays(12).AddHours(17)
                }
            };

            var tiers = new List<TicketTier>
            {
                new TicketTier {Id = 1, Name = "BBB", EventId = 1, ExpirationTime = DateTime.Now.AddDays(5)},
                new TicketTier {Id = 2, Name = "ZZZ", EventId = 1, ExpirationTime = DateTime.Now.AddDays(7)}
            };

            var ticket = new TicketTier
            {
                Id = 1,
                Name = "BBB",
                Price = 5,
                Quantity = 9,
                StartTime = DateTime.Today.AddDays(1),
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
            mockContext.Verify(x => x.SetModified(ticket), Times.Once);
            mockContext.Verify(x => x.SaveChanges(), Times.Once);
        }

        [TestMethod]
        public void SoldTicketsIsUpdated_IfSuccessAndAppearedSoldTickets()
        {
            var events = new List<Event>
            {
                new Event
                {
                    id = 1,
                    time = DateTime.Today.AddDays(12).AddHours(17)
                }
            };

            var tiers = new List<TicketTier>
            {
                new TicketTier {Id = 1, Name = "BBB", EventId = 1, ExpirationTime = DateTime.Now.AddDays(5)},
                new TicketTier {Id = 2, Name = "ZZZ", EventId = 1, ExpirationTime = DateTime.Now.AddDays(7)}
            };

            var ticket = new TicketTier
            {
                Id = 1,
                Name = "BBB",
                Price = 5,
                StartTime = DateTime.Today.AddDays(1),
                ExpirationTime = tiers[0].ExpirationTime,
                EventId = 1
            };

            var mockContext = new Mock<EventDBContext>();
            var tiersMockSet = MoqHelper.CreateDbSet(tiers);
            var eventsMockSet = MoqHelper.CreateDbSet(events);
            mockContext.Setup(x => x.TicketTiers).Returns(tiersMockSet.Object);
            mockContext.Setup(x => x.Events).Returns(eventsMockSet.Object);
            var sellingFacade = new Mock<ISellingFacade>();
            sellingFacade.Setup(x => x.GetSoldTicketsNumber(It.IsAny<int>())).Returns<int>(id => (id == 1) ? 5 : 0);

            var controller = new TicketTiersController(mockContext.Object, sellingFacade.Object);
            var result = controller.ExecuteAction(controller.Post, ticket);

            var actual = result as OkNegotiatedContentResult<TicketTierViewModel>;

            Assert.IsNotNull(actual);
            Assert.AreEqual(5, actual.Content.SoldTicketsCount);

            mockContext.Verify(x => x.SetModified(ticket), Times.Once);
            mockContext.Verify(x => x.SaveChanges(), Times.Once);
        }
    }
}
