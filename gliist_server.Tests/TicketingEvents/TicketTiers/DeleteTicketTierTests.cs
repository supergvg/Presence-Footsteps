using System.Collections.Generic;
using System.Linq;
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
    public class DeleteTicketTierTests
    {
        [TestMethod]
        public void BadRequest_IfTicketTypeDoesNotExists()
        {
            var tiers = new List<TicketTier>
            {
                new TicketTier {Id = 1, Name = "BBB"},
                new TicketTier {Id = 2, Name = "ZZZ"},
                new TicketTier {Id = 3, Name = "AAA"}
            };

            
            var mockContext = new Mock<EventDBContext>();
            var tiersMockSet = MoqHelper.CreateDbSet(tiers);
            mockContext.Setup(x => x.TicketTiers).Returns(tiersMockSet.Object);
            var sellingFacade = new Mock<ISellingFacade>();
            sellingFacade.Setup(x => x.GetSoldTicketsNumber(It.IsAny<int>())).Returns(0);

            var controller = new TicketTiersController(mockContext.Object, sellingFacade.Object);
            var result = controller.ExecuteAction(controller.Delete, 6);

            var actual = result as NotFoundResult;

            Assert.IsNotNull(actual);
            tiersMockSet.Verify(x => x.Remove(It.IsAny<TicketTier>()), Times.Never);
            mockContext.Verify(x => x.SaveChanges(), Times.Never);
        }
        [TestMethod]
        public void BadRequest_IfTicketTypeHasSoldTickets()
        {
            var tiers = new List<TicketTier>
            {
                new TicketTier {Id = 1, Name = "BBB"},
                new TicketTier {Id = 2, Name = "ZZZ"},
                new TicketTier {Id = 3, Name = "AAA"}
            };


            var mockContext = new Mock<EventDBContext>();
            var tiersMockSet = MoqHelper.CreateDbSet(tiers);
            tiersMockSet.Setup(x => x.Find(It.IsInRange(1, 3, Range.Inclusive)))
                .Returns<object[]>(ids =>
                {
                    return tiers.FirstOrDefault(x => x.Id == (int)ids[0]);
                });
            mockContext.Setup(x => x.TicketTiers).Returns(tiersMockSet.Object);
            var sellingFacade = new Mock<ISellingFacade>();
            sellingFacade.Setup(x => x.GetSoldTicketsNumber(It.IsAny<int>())).Returns<int>(id => id);

            var controller = new TicketTiersController(mockContext.Object, sellingFacade.Object);
            var result = controller.ExecuteAction(controller.Delete, 2);

            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.IsNotNull("You cannot delete the ticket tier that has sold tickets.", actual.Message);
            tiersMockSet.Verify(x => x.Remove(It.IsAny<TicketTier>()), Times.Never);
            mockContext.Verify(x => x.SaveChanges(), Times.Never);
        }
        [TestMethod]
        public void OkStatusIsReturned_IfSuccess()
        {
            var tiers = new List<TicketTier>
            {
                new TicketTier {Id = 1, Name = "BBB"},
                new TicketTier {Id = 2, Name = "ZZZ"},
                new TicketTier {Id = 3, Name = "AAA"}
            };


            var mockContext = new Mock<EventDBContext>();
            var tiersMockSet = MoqHelper.CreateDbSet(tiers);
            tiersMockSet.Setup(x => x.Find(It.IsInRange(1, 3, Range.Inclusive)))
                .Returns<object[]>(ids =>
                {
                    return tiers.FirstOrDefault(x => x.Id == (int)ids[0]); 
                });

            mockContext.Setup(x => x.TicketTiers).Returns(tiersMockSet.Object);
            var sellingFacade = new Mock<ISellingFacade>();
            sellingFacade.Setup(x => x.GetSoldTicketsNumber(It.IsAny<int>())).Returns(0);

            var controller = new TicketTiersController(mockContext.Object, sellingFacade.Object);
            var result = controller.ExecuteAction(controller.Delete, 2);

            var actual = result as OkNegotiatedContentResult<int>;

            Assert.IsNotNull(actual);
            Assert.AreEqual(2, actual.Content);
            tiersMockSet.Verify(x => x.Remove(tiers[1]), Times.Once);
            mockContext.Verify(x => x.SaveChanges(), Times.Once);
        }
    }
}
