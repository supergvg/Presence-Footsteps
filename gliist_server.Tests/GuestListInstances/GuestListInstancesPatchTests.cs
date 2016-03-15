using System;
using System.Collections.Generic;
using gliist_server.DataAccess;
using gliist_server.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.GuestListInstances
{
    [TestClass]
    public class GuestListInstancesPatchTests
    {
        [TestMethod]
        [ExpectedException(typeof(ArgumentNullException))]
        public void ThrowException_IfListInstanceIsNull()
        {
            RsvpGuestListInstancePatch.Run(null, null);
        }
        [TestMethod]
        public void ActualNotChanged_IfEventGuestsIsNullOrEmpty()
        {
            var listInstances = GetListInstances();
            RsvpGuestListInstancePatch.Run(listInstances[0], null);

            Assert.IsTrue(listInstances[0].actual.Count == 0);
        }

        [TestMethod]
        public void ActualNotChanged_IfInstanceIsNotRsvp()
        {
            var listInstances = GetListInstances();
            var eventGuests = GetEventGuests();

            RsvpGuestListInstancePatch.Run(listInstances[1], eventGuests);

            Assert.IsTrue(listInstances[1].actual.Count == 3);
            Assert.IsTrue(listInstances[1].actual[0].status == "checked in");
        }

        [TestMethod]
        public void ParticularActualNotChanged_IfCheckinExists()
        {
            var listInstances = GetListInstances();
            listInstances[0].actual = new List<GuestCheckin> {new GuestCheckin {guest = new Guest {id = 55}, plus = 5}};
            var eventGuests = GetEventGuests();

            RsvpGuestListInstancePatch.Run(listInstances[0], eventGuests);

            Assert.IsTrue(listInstances[0].actual.Count == 2);
            Assert.IsTrue(listInstances[0].actual[0].plus == 5);
        }

        [TestMethod]
        public void ActualChanged_IfInstanceIsRsvp()
        {
            var listInstances = GetListInstances();
            var eventGuests = GetEventGuests();

            RsvpGuestListInstancePatch.Run(listInstances[0], eventGuests);

            Assert.IsTrue(listInstances[0].actual.Count == 2);
        }

        [TestMethod]
        public void ActualChangedExactlyTo_IfInstanceRsvp()
        {
            var listInstances = GetListInstances();
            var eventGuests = GetEventGuests();

            RsvpGuestListInstancePatch.Run(listInstances[0], eventGuests);

            Assert.IsTrue(listInstances[0].actual.Count == 2);

            Assert.IsTrue(listInstances[0].actual[0].plus == 0);
            Assert.IsTrue(listInstances[0].actual[0].status == "no show");
            Assert.IsNotNull(listInstances[0].actual[0].guest);
            Assert.IsTrue(listInstances[0].actual[0].guest.email == "user@email.com");
        }

        #region private methods

        private static List<GuestListInstance> GetListInstances()
        {
            return new List<GuestListInstance>
            {
                new GuestListInstance
                {
                    id = 1,
                    InstanceType = GuestListInstanceType.Rsvp,
                    actual = new List<GuestCheckin>()
                },
                new GuestListInstance
                {
                    id = 1,
                    InstanceType = GuestListInstanceType.Confirmed,
                    actual = new List<GuestCheckin>
                    {
                        new GuestCheckin
                        {
                            id = 1,
                            guest = new Guest(),
                            plus = 1,
                            status = "checked in"
                        },
                        new GuestCheckin
                        {
                            id = 2,
                            guest = new Guest(),
                            plus = 0,
                            status = "no show"
                        },
                        new GuestCheckin
                        {
                            id = 3,
                            guest = new Guest(),
                            plus = 2,
                            status = "checked in"
                        }
                    }
                }
            };
        }

        private static IEnumerable<EventGuestStatus> GetEventGuests()
        {
            return new List<EventGuestStatus>()
            {
                new EventGuestStatus
                {
                    Id = 1,
                    GuestListInstanceId = 1,
                    Guest = new Guest
                    {
                        id = 55,
                        email = "user@email.com"
                    }
                },
                new EventGuestStatus
                {
                    Id = 2,
                    GuestListInstanceId = 2,
                    Guest = new Guest()
                },
                new EventGuestStatus
                {
                    Id = 3,
                    GuestListInstanceId = 1,
                    Guest = new Guest()
                }
            };
        }

        #endregion
    }
}

