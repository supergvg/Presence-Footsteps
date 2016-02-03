namespace gliist_server.Models
{
    public static class InviteCodeValidator
    {
        public static bool Run(string inviteCode)
        {
            return inviteCode == "Gliist1031";
        }
    }
}