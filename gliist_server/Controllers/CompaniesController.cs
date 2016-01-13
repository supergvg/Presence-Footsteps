using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using gliist_server.Attributes;
using gliist_server.Models;

namespace gliist_server.Controllers
{
    [RoutePrefix("api/Companies")]

    [Authorize]
    public class CompaniesController : ApiController
    {
        private EventDBContext db = new EventDBContext();

        [AllowAnonymous]
        [Route("GetInviteInfo")]
        public async Task<Invite> GetInviteInfo(string companyName, string token)
        {
            var companies = db.Companies.Where(c => c.name.Equals(companyName));

            Invite retVal = null;
            foreach (var c in companies)
            {
                retVal = c.invitations.FirstOrDefault(i => i.token.Equals(token) && i.acceptedAt == null);
                if (retVal != null)
                {

                    if (retVal.acceptedAt != null)
                    {
                        return null;
                    }

                    break;
                }
            }

            return retVal;
        }

        // GET: api/Companies
        [Route("GetCompanies")]

        public IQueryable<Company> GetCompanies()
        {
            return db.Companies;
        }

        // GET: api/Companies/5
        [ResponseType(typeof(Company))]
        public async Task<IHttpActionResult> GetCompany(int id)
        {
            Company company = await db.Companies.FindAsync(id);
            if (company == null)
            {
                return NotFound();
            }

            return Ok(company);
        }

        // PUT: api/Companies/5
        [ResponseType(typeof(void))]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> PutCompany(int id, Company company)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != company.id)
            {
                return BadRequest();
            }

            db.Entry(company).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CompanyExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Companies
        [ResponseType(typeof(Company))]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> PostCompany(Company company)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Companies.Add(company);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = company.id }, company);
        }

        // POST: api/Update socials
        [Route("UpdateSocialLinks")]
        [ResponseType(typeof(Company))]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> UpdateSocialLinks(CompanySocialLinksModel companySocialLinksModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var company = db.Companies.FirstOrDefault(x => x.id == companySocialLinksModel.id);
            if (company == null)
            {
                return BadRequest("Company not found");
            }

            company.FacebookPageUrl = companySocialLinksModel.FacebookPageUrl ?? string.Empty;
            company.TwitterPageUrl = companySocialLinksModel.TwitterPageUrl ?? string.Empty;
            company.InstagrammPageUrl = companySocialLinksModel.InstagrammPageUrl ?? string.Empty;
            db.Entry(company).State = EntityState.Modified;
            await db.SaveChangesAsync();

            return Ok("Saved");
        }

        // DELETE: api/Companies/5
        [ResponseType(typeof(Company))]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> DeleteCompany(int id)
        {
            Company company = await db.Companies.FindAsync(id);
            if (company == null)
            {
                return NotFound();
            }

            db.Companies.Remove(company);
            await db.SaveChangesAsync();

            return Ok(company);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CompanyExists(int id)
        {
            return db.Companies.Count(e => e.id == id) > 0;
        }
    }
}