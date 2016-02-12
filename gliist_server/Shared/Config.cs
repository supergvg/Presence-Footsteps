using System.Configuration;

namespace gliist_server
{
    static class Config
    {
        public static string AppBaseUrl = ConfigurationManager.AppSettings["appBaseUrl"];
    }
}