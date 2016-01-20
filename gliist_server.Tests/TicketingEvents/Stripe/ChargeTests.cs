using System;
using System.Net;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.TicketingEvents
{
    [TestClass]
    public class TicketsPurchasingTests
    {
        [TestMethod]
        public void CreateCharge()
        {
            const string url = StripeSettings.BaseUrl + StripeSettings.Version + "/charges";

            var request = (HttpWebRequest) WebRequest.Create(url);
            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";

            const string parameters = "amount=400&currency=usd&description=Charge for test@example.com" + 
                "&source[exp_month]=08" +
                "&source[exp_year]=2016" +
                "&source[number]=4242424242424242" +
                "&source[object]=card" +
                "&source[cvc]=353";

            request.Headers.Add("Authorization", GetAuthorizationHeaderValue(StripeSettings.SecretKey));
            request.UserAgent = "GJests (http://app.gjests.com/)";

            byte[] bytes = Encoding.ASCII.GetBytes(parameters);
            request.ContentLength = bytes.Length;
            
            System.IO.Stream os = request.GetRequestStream();
            os.Write(bytes, 0, bytes.Length);
            os.Close();

            using (var resp = request.GetResponse())
            {
                System.IO.StreamReader sr = new System.IO.StreamReader(resp.GetResponseStream());
                var actual = sr.ReadToEnd().Trim();
            }

        }

        private string GetAuthorizationHeaderValue(object apiKey)
        {
            var token = Convert.ToBase64String(Encoding.UTF8.GetBytes(string.Format("{0}:", apiKey)));
            return string.Format("Basic {0}", token);
        }

        public static string HttpPost(string url, string parameters)
        {
            var req = WebRequest.Create(url);
            
            
            //We need to count how many bytes we're sending. Post'ed Faked Forms should be name=value&
            
            System.Net.WebResponse resp = req.GetResponse();
            if (resp == null) return null;
            System.IO.StreamReader sr = new System.IO.StreamReader(resp.GetResponseStream());
            return sr.ReadToEnd().Trim();
        }

    }
}
