using System.Collections.Generic;
using Microsoft.ServiceBus.Notifications;
using Microsoft.WindowsAzure;

namespace gliist_server.Helpers
{
    public static class PushNotificationHelper
    {


        public static void SendNotification(string message, string companyId)
        {
            var cs = CloudConfigurationManager.GetSetting("NotificationHubConnectionString");
            NotificationHubClient nhc = NotificationHubClient.CreateClientFromConnectionString(cs, "gjestshub");
            TemplateNotification tn = new TemplateNotification(new Dictionary<string, string> { { "message", message } });

            nhc.SendNotificationAsync(tn, companyId);
        }
    }
}