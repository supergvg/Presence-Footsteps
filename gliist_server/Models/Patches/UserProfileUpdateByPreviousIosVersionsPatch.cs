using System;

namespace gliist_server.Models.Patches
{
    public class UserProfileUpdateByPreviousIosVersionsPatch
    {
        private static string mistakeField = "phoneNumbel";

        public static void Run(UserProfile userProfile)
        {
            if (userProfile == null)
                throw new ArgumentNullException("userProfile");

            if (IsModificationRequired(userProfile))
                ApplyPatch(userProfile);
        }

        private static void ApplyPatch(UserProfile userProfile)
        {
            userProfile.PhoneNumber = userProfile.PhoneNumbel;
        }

        private static bool IsModificationRequired(UserProfile userProfile)
        {
            return string.IsNullOrEmpty(userProfile.PhoneNumber) && !string.IsNullOrEmpty(userProfile.PhoneNumbel);
        }
    }
}