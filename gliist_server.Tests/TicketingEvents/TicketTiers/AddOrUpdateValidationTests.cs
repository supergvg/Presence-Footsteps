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

        [TestMethod]
        public void BadRequest_IfExpirationDateIsPast()
        {
            var controller = new TicketTiersController();

            var result = controller.ExecuteAction(controller.Post, new TicketTier { Name = "name", Price = 5, Quantity = 3, ExpirationDate = DateTime.Now.AddHours(-1)});

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Expiration Date is past.", actual.Message);
        }

        [TestMethod]
        public void BadRequest_IfExpirationDateIsLaterThan3HoursBeforeEvent()
        {
            var data = new List<Event>
            {
                new Event
                {
                    id = 1,
                    time = DateTime.Today.AddDays(1).AddHours(17)
                },
                
            };

            var mockContext = new Mock<EventDBContext>();
            var eventMockSet = MoqHelper.CreateDbSet(data);
            var ticketTierMockSet = MoqHelper.CreateDbSet(new TicketTier[] {});
            mockContext.Setup(x => x.Events).Returns(eventMockSet.Object);
            mockContext.Setup(x => x.TicketTiers).Returns(ticketTierMockSet.Object);
            mockContext.Setup(x => x.SetModified(data[0])).Callback(() => { });
            
            var controller = new TicketTiersController(mockContext.Object);
            var result = controller.ExecuteAction(controller.Post,
                new TicketTier
                {
                    Name = "name",
                    Price = 5, 
                    Quantity = 3,
                    ExpirationDate = DateTime.Today.AddDays(1).AddHours(16),
                    EventId = 1
                });
            
            var result2 = controller.ExecuteAction(controller.Post,
                new TicketTier
                {
                    Name = "name",
                    Price = 5,
                    Quantity = 3,
                    ExpirationDate = DateTime.Today.AddDays(1).AddHours(13),
                    EventId = 1
                });

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Expiration Date is incorrect.", actual.Message);

            var actual2 = result2 as OkNegotiatedContentResult<TicketTier>;

            Assert.IsNotNull(actual2);
            mockContext.Verify(x => x.SaveChanges(), Times.Once);
        }
    }
}
