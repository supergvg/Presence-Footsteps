using System;
using System.Collections.Generic;
using System.Linq;
using gliist_server.DataAccess;
using gliist_server.Helpers;
using gliist_server.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.GuestListInstances
{
    [TestClass]
    public class GuestTotalCountTests
    {
        [ExpectedException(typeof(ArgumentNullException))]
        [TestMethod]
        public void ThrowException_IfEventIsNull()
        {
            EventHelper.GetGuestsCount(null, new GuestListInstance());
        }

        [ExpectedException(typeof(ArgumentNullException))]
        [TestMethod]
        public void ThrowException_IfListInstanceIsNull()
        {
            EventHelper.GetGuestsCount(new Event(), null);
        }

        [TestMethod]
        public void SummarizeOnlyGuests_IfGuestIsPublicAndNotConfirmed()
        {
            var listInstance = CreateListInstance("public");
            listInstance.actual = new List<GuestCheckin>();

            var @event = new Event
            {
                EventGuestStatuses = new[]
                {
                    new EventGuestStatus
                    {
                        GuestListInstanceId = listInstance.id,
                        AdditionalGuestsRequested = 5
                    },
                    new EventGuestStatus
                    {
                        GuestListInstanceId = listInstance.id,
                        AdditionalGuestsRequested = 3
                    }
                }.ToList()
            };

            var actual = EventHelper.GetGuestsCount(@event, listInstance);

            Assert.IsTrue(actual == 2);
        }

        [TestMethod]
        public void SummarizeGuestsAndTheirPluses_IfGuestIsPublicAndConfirmed()
        {
            var listInstance = CreateListInstance("public");
            listInstance.actual = new List<GuestCheckin>
            {
                new GuestCheckin
                {
                    guest = new Guest
                    {
                        id = 2
                    }
                }
            };

            var @event = new Event
            {
                EventGuestStatuses = new[]
                {
                    new EventGuestStatus
                    {
                        GuestListInstanceId = listInstance.id,
                        AdditionalGuestsRequested = 5,
                        GuestId = 1
                    },
                    new EventGuestStatus
                    {
                        GuestListInstanceId = listInstance.id,
                        AdditionalGuestsRequested = 3,
                        GuestId = 2
                    }
                }.ToList()
            };

            var actual = EventHelper.GetGuestsCount(@event, listInstance);

            Assert.IsTrue(actual == 5);
        }

        [TestMethod]
        public void SummarizeGuestsAndTheirPluses_IfGuestIsNotPublic()
        {
            var listInstance = CreateListInstance("not_public");

            var @event = new Event
            {
                EventGuestStatuses = new[]
                {
                    new EventGuestStatus
                    {
                        GuestListInstanceId = listInstance.id,
                        AdditionalGuestsRequested = 5
                    },
                    new EventGuestStatus
                    {
                        GuestListInstanceId = listInstance.id,
                        AdditionalGuestsRequested = 3
                    }
                }.ToList()
            };

            var actual = EventHelper.GetGuestsCount(@event, listInstance);

            Assert.IsTrue(actual == 10);
        }

        private static GuestListInstance CreateListInstance(string type)
        {
            return new GuestListInstance
            {
                id = 1,
                InstanceType = type == "public" ? GuestListInstanceType.PublicRsvp : GuestListInstanceType.Default
            };
        }
    }
}
