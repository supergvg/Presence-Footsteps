using System;
using System.Collections.Generic;
using System.Web.Http.Results;
using gliist_server.Areas.Ticketing.Controllers;
using gliist_server.Areas.Ticketing.Models;
using gliist_server.Models;
using gliist_server.Tests.Shared;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace gliist_server.Tests.TicketingEvents.TicketTypes
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
            var data = new List<TicketType>
            {
                new TicketType {Name = "BBB"},
                new TicketType {Name = "ZZZ"},
                new TicketType {Name = "AAA"},
            };

            var mockContext = new Mock<EventDBContext>();
            var mockSet = MoqHelper.CreateDbSet(data);
            mockContext.Setup(x => x.TicketTypes).Returns(mockSet.Object);

            var controller = new TicketTypesController(mockContext.Object);
            var result = controller.ExecuteAction(controller.Post,
                new TicketType
                {
                    Name = "First",
                    EventId = 1,
                    ExpirationDate = new DateTime(2016, 01, 22),
                    Price = 55,
                    Quantity = 32
                });

            mockSet.Verify(m => m.Add(It.IsAny<TicketType>()), Times.Once());
            mockContext.Verify(m => m.SaveChanges(), Times.Once()); 

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Wrong ticket type.", actual.Message);
        }
    }
}
