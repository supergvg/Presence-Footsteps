using gliist_server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace gliist_server.Controllers
{
    [Authorize]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class EventController : ApiController
    {
        static List<Event> _events = new List<Event> { new Event { name = "oscars", id = '0' } };
        // GET api/event
        public IEnumerable<Event> Get()
        {
            return _events;
        }

        // GET api/event/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/event
        public HttpResponseMessage Post([FromBody]Event value)
        {
            _events.Add(value);

            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        // PUT api/event/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/event/5
        public void Delete(int id)
        {
        }
    }
}
