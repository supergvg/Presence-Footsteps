using System;
using System.Collections.Generic;
using gliist_server.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests
{
    [TestClass]
    public class EventGuestListsActualPlusesPatchTests
    {
        [TestMethod]
        [ExpectedException(typeof(ArgumentNullException))]
        public void ThrowException_IfEventIsNull()
        {
            EventGuestListsActualPlusesPatch.Run(null);
        }

        [TestMethod]
        public void PlusNotChanged_IfEventGuestStatusIsNotFound()
        {
            var @event = new Event
            {
                EventGuestStatuses = new List<EventGuestStatus>()
                {
                    new EventGuestStatus
                    {
                        GuestListInstanceId = 1,
                        GuestId = 1,
                        AdditionalGuestsRequested = 3
                    }
                },
                guestLists = new List<GuestListInstance>()
                {
                    new GuestListInstance
                    {
                        actual = new List<GuestCheckin>()
                        {
                            new GuestCheckin
                            {
                                guestList = new GuestListInstance
                                {
                                    id = 7
                                },
                                guest = new Guest
                                {
                                    id = 1,
                                    plus = 5
                                }
                            }
                        }
                    }
                }
            };

            EventGuestListsActualPlusesPatch.Run(@event);

            Assert.IsTrue(@event.guestLists[0].actual[0].guest.plus == 5);
        }

        [TestMethod]
        public void PlusChangedToAdditionalGuestsRequested_IfEventGuestStatusIsFound()
        {
            var @event = new Event
            {
                EventGuestStatuses = new List<EventGuestStatus>
                {
                    new EventGuestStatus
                    {
                        GuestListInstanceId = 1,
                        GuestId = 1,
                        AdditionalGuestsRequested = 3
                    }
                },
                guestLists = new List<GuestListInstance>()
                {
                    new GuestListInstance
                    {
                        actual = new List<GuestCheckin>()
                        {
                            new GuestCheckin
                            {
                                guestList = new GuestListInstance
                                {
                                    id = 1
                                },
                                guest = new Guest
                                {
                                    id = 1,
                                    plus = 5
                                }
                            }
                        }
                    }
                }
            };

            EventGuestListsActualPlusesPatch.Run(@event);

            Assert.IsTrue(@event.guestLists[0].actual[0].guest.plus == 3);
        }
    }
}
