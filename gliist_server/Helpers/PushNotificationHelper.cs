using Microsoft.ServiceBus.Notifications;
using Microsoft.WindowsAzure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;


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