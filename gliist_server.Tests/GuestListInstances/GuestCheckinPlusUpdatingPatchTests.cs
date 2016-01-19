using System;
using System.Collections.Generic;
using gliist_server.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.GuestListInstances
{
    [TestClass]
    public class GuestCheckinPlusUpdatingPatchTests
    {
        [TestMethod]
        [ExpectedException(typeof(ArgumentNullException))]
        public void ThrowException_IfListInstanceIsNull()
        {
            GuestCheckinPlusUpdatingPatch.Run(null, null);
        }

        [TestMethod]
        public void NotChanged_IfEventGuestIsNull()
        {
            var listInstance = CreateListInstance(GuestListInstanceType.Default);
            var firstActualPlus = listInstance.actual[0].plus;

            GuestCheckinPlusUpdatingPatch.Run(listInstance, null);

            Assert.AreEqual(listInstance.actual[0].plus, firstActualPlus);
        }

        [TestMethod]
        public void NotChanged_IfListTypeIsRsvp()
        {
            var listInstance = CreateListInstance(GuestListInstanceType.Rsvp);
            var expected = listInstance.actual[0].plus;

            var eventGuests = new[] {new EventGuestStatus
            {
                GuestId = 1,
                AdditionalGuestsRequested = 4
            }};

            GuestCheckinPlusUpdatingPatch.Run(listInstance, eventGuests);

            Assert.AreEqual(listInstance.actual[0].plus, expected);
        }

        [TestMethod]
        public void NotChanged_IfListTypeIsPublicRsvp()
        {
            var listInstance = CreateListInstance(GuestListInstanceType.PublicRsvp);
            var expected = listInstance.actual[0].plus;

            var eventGuests = new[] {new EventGuestStatus
            {
                GuestId = 1,
                AdditionalGuestsRequested = 4
            }};

            GuestCheckinPlusUpdatingPatch.Run(listInstance, eventGuests);

            Assert.AreEqual(listInstance.actual[0].plus, expected);
        }

        [TestMethod]
        public void MovedFromGuestPlus_IfStatusIsNotCheckedIn()
        {
            var listInstance = CreateListInstance(GuestListInstanceType.Confirmed);
            var expected = listInstance.actual[0].guest.plus;

            var eventGuests = new[] {new EventGuestStatus
            {
                GuestId = 1,
                AdditionalGuestsRequested = 4
            }};

            GuestCheckinPlusUpdatingPatch.Run(listInstance, eventGuests);

            Assert.AreEqual(listInstance.actual[0].plus, expected);
        }

        [TestMethod]
        public void NotChanged_IfStatusIsCheckedInAndEventGuestIsAbsent()
        {
            var listInstance = CreateListInstance(GuestListInstanceType.PublicRsvp);
            var expected = listInstance.actual[1].plus;

            var eventGuests = new[] {new EventGuestStatus
            {
                GuestId = 1,
                AdditionalGuestsRequested = 4
            }};

            GuestCheckinPlusUpdatingPatch.Run(listInstance, eventGuests);

            Assert.AreEqual(listInstance.actual[1].plus, expected);
        }

        [TestMethod]
        public void Calculated_IfStatusIsCheckedIn()
        {
            var listInstance = CreateListInstance(GuestListInstanceType.Confirmed);

            var eventGuests = new[] {new EventGuestStatus
            {
                GuestId = 2,
                AdditionalGuestsRequested = 4
            }};

            var expected = listInstance.actual[1].guest.plus -
                           (eventGuests[0].AdditionalGuestsRequested - listInstance.actual[1].plus);

            GuestCheckinPlusUpdatingPatch.Run(listInstance, eventGuests);

            Assert.AreEqual(listInstance.actual[1].plus, expected);
        }

        [TestMethod]
        public void CalculatedToZero_IfStatusIsCheckedInAndResultIsNegative()
        {
            var listInstance = CreateListInstance(GuestListInstanceType.Confirmed);

            var eventGuests = new[] {new EventGuestStatus
            {
                GuestId = 2,
                AdditionalGuestsRequested = 5
            }};

            GuestCheckinPlusUpdatingPatch.Run(listInstance, eventGuests);

            Assert.AreEqual(0, listInstance.actual[1].plus);
        }

        private static GuestListInstance CreateListInstance(GuestListInstanceType type)
        {
            return new GuestListInstance
            {
                InstanceType = type,
                actual = new List<GuestCheckin>()
                {
                    new GuestCheckin
                    {
                        status = "no show",
                        plus = 1,
                        guest = new Guest
                        {
                            id = 1,
                            plus = 3
                        }
                        
                    },
                    new GuestCheckin
                    {
                        status = "checked in",
                        plus = 1,
                        guest = new Guest
                        {
                            id = 2,
                            plus = 3
                        }
                    }
                }
            };
        }
    }
}
