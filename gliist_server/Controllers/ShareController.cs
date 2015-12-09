using System.Configuration;
using System.Data.Entity;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using gliist_server.Models;
using gliist_server.Shared;

namespace gliist_server.Controllers
{
    [RoutePrefix("api/share")]
    public class ShareController : ApiController
    {
        private EventDBContext db;

        public ShareController()
            : base()
        {
            db = new EventDBContext();
        }

        [HttpGet]
        [Route("facebook/{companyName}/{eventName}")]
        public HttpResponseMessage FacebookShare(string companyName, string eventName)
        {
            companyName = GjestsLinksGenerator.FromUrlSafeName(companyName);
            eventName = GjestsLinksGenerator.FromUrlSafeName(eventName);

            int eventId;
            Event @event = null;
            var response = new HttpResponseMessage();

            var websiteUrl = ConfigurationManager.AppSettings["appBaseUrl"] ?? "";
            var url = Path.Combine(websiteUrl, string.Format("#/rsvp/{0}/{1}", companyName, eventName));
            var title = "";
            var description = "";
            var metaImage = "";
            const string template = "<html><head><meta http-equiv=\"refresh\" content=\"0;url='{0}'\"><meta property=\"og:title\" content=\"{1}\" /><meta property=\"og:description\" content=\"{2}\" />{3}</head><body></body></html>";

            if (int.TryParse(eventName, out eventId))
            {
                @event = db.Events.FirstOrDefault(x => x.id == eventId && !x.isDeleted);
            }
            else
            {
                @event = db.Set<Event>()
                    .Where(x => x.title.ToLower() == eventName.ToLower() && !x.isDeleted)
                    .OrderByDescending(x => x.endTime)
                    .Include(x => x.company)
                    .Include(x => x.Tickets)
                    .FirstOrDefault(x => x.company.name.ToLower() == companyName.ToLower());
            }

            if (@event != null)
            {
                title = @event.title;
                description = string.Format("{0} is hosting {1}! RSVP here {2}", companyName, @event.title, url);

                if (!string.IsNullOrEmpty(@event.invitePicture))
                {
                    using (WebClient wc = new WebClient())
                    {
                        byte[] bytes = wc.DownloadData(@event.invitePicture);

                        using (MemoryStream ms = new MemoryStream(bytes))
                        {
                            using (var image = Image.FromStream(ms))
                            {
                                var extension = "image/jpg";

                                if (ImageFormat.Png.Equals(image.RawFormat))
                                {
                                    extension = "image/png";
                                }
                                else if (ImageFormat.Gif.Equals(image.RawFormat))
                                {
                                    extension = "image/gif";
                                }

                                metaImage =
                                    string.Format(@"<meta property=""og:image"" content=""{0}"" />
                                                    <meta property=""og:image:type"" content=""{1}"" />
                                                    <meta property=""og:image:width"" content=""{2}"" />
                                                    <meta property=""og:image:height"" content=""{3}"" />", @event.invitePicture, extension, image.Width, image.Height);
                            }
                        }
                    }
                }
            }

            var content = string.Format(template, url, title, description, metaImage);

            response.Content = new StringContent(content);
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/html");

            return response;
        }
    }
}