using System;
using System.Text;
using System.Web;
using gliist_server.Models;

namespace gliist_server.Shared
{
    public class GjestsLinksGenerator
    {
        // if you change the salt then links that sent in email will broke
        internal const string salt = "gjests00";
        private string baseUrl = string.Empty;

        public GjestsLinksGenerator(string baseUrl)
        {
            if (!string.IsNullOrEmpty(baseUrl) && !baseUrl.EndsWith("/"))
            {
                baseUrl += "/";
            }
            this.baseUrl = baseUrl;
        }

        public string GenerateGuestTicketsLandingPageLink(int eventId, int guestId)
        {
            var eventGusetEmailToken = CreateEventGuestToken(eventId, guestId);
            string url = string.Format("{0}#/tickets/{1}", baseUrl, eventGusetEmailToken.UrlSafeToken);
            return url;
        }

        public string GenerateGuestRsvpLandingPageLink(int eventId, int guestId)
        {
            var eventGusetEmailToken = CreateEventGuestToken(eventId, guestId);
            string url = string.Format("{0}#/rsvp/{1}", baseUrl, eventGusetEmailToken.UrlSafeToken);
            return url;
        }

        public string GeneratePublicRsvpLandingPageLink(string eventCompany, string eventName)
        {
            string url = string.Format("{0}#/rsvp/{1}/{2}", baseUrl, ToUrlSafeName(eventCompany), ToUrlSafeName(eventName));
            return url;
        }

        public string GeneratePublicTicketsLandingPageLink(string eventCompany, string eventName)
        {
            string url = string.Format("{0}#/tickets/{1}/{2}", baseUrl, ToUrlSafeName(eventCompany), ToUrlSafeName(eventName));
            return url;
        }

        public static string ToUrlSafeName(string name)
        {
            if (string.IsNullOrEmpty(name))
                return string.Empty;
            return HttpUtility.UrlEncode(name.Replace(' ', '_'));
        }

        public static string FromUrlSafeName(string name)
        {
            if (string.IsNullOrEmpty(name))
                return string.Empty;
            return HttpUtility.UrlDecode(name).Replace('_', ' ');
        }

        public static EventGuestMailToken CreateEventGuestToken(int eventId, int guestId)
        {
            string stringToEncrypt = string.Format("{0},{1}", eventId, guestId);
            var token = new EventGuestMailToken()
            {
                Token = EncryptString(stringToEncrypt),
                EventId = eventId,
                GuestId = guestId
            };
            token.UrlSafeToken = HttpServerUtility.UrlTokenEncode(Encoding.UTF8.GetBytes(token.Token));
            return token;
        }

        public static EventGuestMailToken ParseEventGuestToken(string token)
        {
            EventGuestMailToken eventGuestMail = null;
            try
            {
                string urlDecodedToken = Encoding.UTF8.GetString(HttpServerUtility.UrlTokenDecode(token));
                string[] values = DeryptString(urlDecodedToken).Split(',');
                eventGuestMail = new EventGuestMailToken()
                {
                    EventId = Convert.ToInt32(values[0]),
                    GuestId = Convert.ToInt32(values[1]),
                    Token = token
                };
            }
            catch (Exception ex)
            {
                eventGuestMail = null;
            }
            return eventGuestMail;
        }

        private static string EncryptString(string text)
        {
            return RijndaelManagedEncryption.EncryptRijndael(text, salt);
        }

        private static string DeryptString(string text)
        {
            return RijndaelManagedEncryption.DecryptRijndael(text, salt);
        }
    }
}
