using System;
using gliist_server.Models.Patches;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.UserProfile
{
    [TestClass]
    public class UserProfileUpdateByPreviousIosVersionsPatchTest
    {
        [TestMethod]
        [ExpectedException(typeof(ArgumentNullException))]
        public void ThrowException_IfUserProfileIsNull()
        {
            UserProfileUpdateByPreviousIosVersionsPatch.Run(null);
        }

        [TestMethod]
        public void Changed_If_PhoneNumbel_Exists_And_No_PhoneNumber()
        {
            string expected = "12345";
            var userProfile = new Models.UserProfile
            {
                PhoneNumber = null,
                PhoneNumbel = expected
            };

            UserProfileUpdateByPreviousIosVersionsPatch.Run(userProfile);
            Assert.AreEqual(userProfile.PhoneNumber, expected);
        }

        [TestMethod]
        public void Not_Changed_If_PhoneNumber_Exists()
        {
            string expectedValue = "12345";

            var userProfile = new Models.UserProfile
            {
                PhoneNumber = expectedValue,
                PhoneNumbel = "54321"
            };

            UserProfileUpdateByPreviousIosVersionsPatch.Run(userProfile);

            Assert.AreEqual(userProfile.PhoneNumber, expectedValue);
        }
    }
}
