using System;
using System.Diagnostics;
using System.Net;
using System.Text;

namespace gliist_server.Tests.TicketingEvents.Stripe
{
    static class HttpHelper
    {
        public static string Post(string relativeUrl, string parameters)
        {
            var request = (HttpWebRequest)WebRequest.Create(Settings.BaseUrl + Settings.Version + relativeUrl);
            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";

            request.Headers.Add("Authorization", GetBase64(Settings.SecretKey));
            request.UserAgent = "GJests (http://app.gjests.com/)";

            PutParameters(parameters, request);

            try
            {
                using (var response = request.GetResponse())
                {
                    var responseStream = response.GetResponseStream();
                    if (responseStream == null)
                        return string.Empty;

                    var sr = new System.IO.StreamReader(responseStream);
                    return sr.ReadToEnd().Trim();
                }
            }
            catch (WebException ex)
            {
                Debug.WriteLine(ex);
                return string.Empty;
            }
        }

        private static void PutParameters(string parameters, HttpWebRequest request)
        {
            var bytes = Encoding.ASCII.GetBytes(parameters);
            request.ContentLength = bytes.Length;

            using (var os = request.GetRequestStream())
            {
                os.Write(bytes, 0, bytes.Length);
            }
        }

        private static string GetBase64(string input)
        {
            var token = Convert.ToBase64String(Encoding.UTF8.GetBytes(string.Format("{0}:", input)));
            return string.Format("Basic {0}", token);
        }
    }
}