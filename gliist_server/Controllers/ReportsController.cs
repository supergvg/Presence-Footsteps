using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.DataAccess;
using gliist_server.Models;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace gliist_server.Controllers
{
    [Authorize]
    [RoutePrefix("api/reports")]
    public class ReportsController : ApiController
    {
        private readonly EventDBContext db;

        public ReportsController()
        {
            this.db = new EventDBContext();
        }

        // GET api/reports/exportrsvp/5?authToken={token}
        [HttpGet]
        [ResponseType(typeof(byte[]))]
        [Route("exportrsvp/{eventId}")]
        public HttpResponseMessage ExportRsvp(int eventId)
        {
            var @event = db.Events.Find(eventId);
            var excelFile = CreateRsvpReportFile(
                @event.guestLists.Where(x => x.InstanceType == GuestListInstanceType.Rsvp || x.InstanceType == GuestListInstanceType.PublicRsvp),
                (@event.company != null) ? @event.company.name: "unknown");

            MediaTypeHeaderValue mimeType = new MediaTypeHeaderValue("application/vnd.ms-excel");

            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(excelFile);
            response.Content.Headers.ContentType = mimeType;
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
            string fileName = string.Format("{0}_{1}.xls", (!string.IsNullOrEmpty(@event.title)) ? @event.title : @event.id.ToString(), DateTime.Today.ToString("MM-dd-yyyy"));
            response.Content.Headers.ContentDisposition.FileName = fileName;

            return response;
        }

        // GET api/reports/rsvpvisitors/5
        [HttpGet]
        [ResponseType(typeof(int))]
        [Route("rsvpvisitors/{eventId}")]
        public IHttpActionResult GetRsvpVisitors(int eventId)
        {
            var @event = db.Events.Find(eventId);
            

            return Ok(@event.PublicVisitors);
        }

        // POST api/reports/rsvpvisitors/5
        [HttpPost]
        [ResponseType(typeof(int))]
        [Route("rsvpvisitors/{eventId}")]
        public IHttpActionResult IncreaseRsvpVisitors(int eventId)
        {
            var @event = db.Events.Find(eventId);
            @event.PublicVisitors++;
            db.SaveChanges();

            return Ok();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        public static byte[] CreateRsvpReportFile(IEnumerable<GuestListInstance> guestLists, string companyName)
        {
            byte[] bytes = null;

            using (var excel = new ExcelPackage())
            {
                excel.Workbook.Worksheets.Add("RSVP");

                var pendingWorksheet = excel.Workbook.Worksheets[1];
                pendingWorksheet.Cells[1, 1, 1, 4].Style.Font.Bold = true;
                pendingWorksheet.Cells[1, 1, 1, 4].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                pendingWorksheet.Cells[1, 1].Value = "name";
                pendingWorksheet.Cells[1, 2].Value = "email";
                pendingWorksheet.Cells[1, 3].Value = "company";
                pendingWorksheet.Cells[1, 4].Value = "pluses";


                var guestListInstances = guestLists as GuestListInstance[] ?? guestLists.ToArray();

                if (guestListInstances.Any())
                {
                    int i = 2;
                    foreach (var inst in guestListInstances)
                    {
                        var guests = inst.actual;

                        foreach (var g in guests)
                        {
                            pendingWorksheet.Cells[i, 1].Value = string.Concat(g.guest.firstName, " ", g.guest.lastName);
                            pendingWorksheet.Cells[i, 2].Value = g.guest.email ?? string.Empty;
                            pendingWorksheet.Cells[i, 3].Value = companyName;
                            pendingWorksheet.Cells[i, 4].Value = g.plus;
                            i++;
                        }
                    }
                }

                bytes = excel.GetAsByteArray();
            }

            return bytes;
        }
    }
}
