using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using gliist_server.Attributes;
using gliist_server.Helpers;
using gliist_server.Models;
using gliist_server.Providers;
using gliist_server.Results;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;

namespace gliist_server.Controllers
{
    [Authorize]
    [RoutePrefix("api/Account")]
    public class AccountController : ApiController
    {
        private const string LocalLoginProvider = "Local";
        private readonly EventDBContext _db;
        public AccountController()
            : this(new EventDBContext())
        {
        }

        public AccountController(EventDBContext db)
            : this(Startup.UserManagerFactory(db), Startup.OAuthOptions.AccessTokenFormat)
        {
            _db = db;
        }

        public AccountController(UserManager<UserModel> userManager,
            ISecureDataFormat<AuthenticationTicket> accessTokenFormat)
        {
            UserManager = userManager;
            AccessTokenFormat = accessTokenFormat;
            var userValidator = UserManager.UserValidator as UserValidator<UserModel>;
            userValidator.AllowOnlyAlphanumericUserNames = false;
        }

        public UserManager<UserModel> UserManager { get; private set; }
        public ISecureDataFormat<AuthenticationTicket> AccessTokenFormat { get; private set; }

        // GET api/Account/UserInfo
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("UserInfo")]
        public async Task<UserInfoViewModel> GetUserInfo()
        {
            ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

            return new UserInfoViewModel
            {
                userId = User.Identity.GetUserId(),
                UserName = User.Identity.GetUserName(),
                firstName = user.firstName,
                lastName = user.lastName,
                email = user.UserName,
                phoneNumber = user.phoneNumber,
                city = user.city,
                company = user.company.name,
                company_id = user.company.id.ToString(),
                bio = user.bio,
                permissions = user.permissions,
                TwitterPageUrl = user.company.TwitterPageUrl ?? string.Empty,
                FacebookPageUrl = user.company.FacebookPageUrl ?? string.Empty,
                InstagrammPageUrl = user.company.InstagrammPageUrl ?? string.Empty,
                HasRegistered = externalLogin == null,
                LoginProvider = externalLogin != null ? externalLogin.LoginProvider : null
            };
        }

        // GET api/Account/CompanyInfo
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("CompanyInfo")]
        public async Task<Company> GetCompanyInfo()
        {
            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

            return user.company;
        }

        // GET api/Account/CompanyInfo
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("InviteUser")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<Company> PostInviteUser(UserModel newUser)
        {
            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

            var existingUser = _db.Users.FirstOrDefault(u => newUser.UserName == u.UserName);

            if (existingUser != null)
            {
                throw new ArgumentException("User Already Registered");
            }


            var invite = user.company.invitations.FirstOrDefault(i => string.Equals(i.email, newUser.UserName));
            if (invite == null)
            {
                invite = new Invite()
                {
                    firstName = newUser.firstName,
                    lastName = newUser.lastName,
                    email = newUser.UserName,
                    permissions = newUser.permissions.ToLower(),
                    phoneNumber = newUser.phoneNumber,

                    token = Guid.NewGuid().ToString(),

                };

                user.company.invitations.Add(invite);
            }
            else
            {
                _db.Entry(invite).State = EntityState.Modified;
                invite.firstName = newUser.firstName;
                invite.lastName = newUser.lastName;
                invite.email = newUser.UserName;
                invite.permissions = newUser.permissions.ToLower();
                invite.phoneNumber = newUser.phoneNumber;
                invite.acceptedAt = null;
            }

            EmailHelper.SendJoinRequest(newUser, user, invite, Request);

            await _db.SaveChangesAsync();

            return user.company;
        }

        // GET api/Account/CompanyInfo
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("UpdateCompanyUser")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> PutUpdateCompanyUser(UserModel newUser)
        {
            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

            if (string.IsNullOrEmpty(newUser.Id))
            {
                return BadRequest("Invalid User");

            }

            if (user.permissions != null && (user.permissions.Contains("staff") || user.permissions.Contains("promoter")))
            {
                return BadRequest("Invalid permissions");
            }


            var user_to_update = await UserManager.FindByIdAsync(newUser.Id);

            user_to_update.firstName = newUser.firstName;
            user_to_update.lastName = newUser.lastName;
            user_to_update.phoneNumber = newUser.phoneNumber;
            user_to_update.permissions = newUser.permissions.ToLower();

            _db.Entry(user_to_update).State = EntityState.Modified;

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }




        // GET api/Account/CompanyInfo
        [Route("CreateUserByAccount")]
        [AllowAnonymous]
        [HttpPost]
        public async Task<IHttpActionResult> PostRegisterByInvite(RegisterBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            var companies = _db.Companies.Where(c => c.name == model.company);

            if (companies == null)
            {
                return BadRequest();
            }

            Invite invite = null;
            Company company = null;
            foreach (var c in companies)
            {
                invite = c.invitations.SingleOrDefault(i => i.token.Equals(model.token));

                if (invite != null)
                {
                    company = c;
                    break;
                }
            }

            if (invite == null)
            {
                return BadRequest("Invitation exptied please contact admin");
            }

            _db.Entry(invite).State = EntityState.Modified;

            invite.acceptedAt = DateTimeOffset.Now;

            if (!string.Equals(model.UserName, invite.email))
            {
                return BadRequest();
            }

            UserModel user = new UserModel
            {
                UserName = model.UserName,
                firstName = model.firstName,
                lastName = model.lastName,
                company = company,

                permissions = invite.permissions
            };

            company.users.Add(user);

            IdentityResult result = await UserManager.CreateAsync(user, model.Password);
            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            EmailHelper.SendWelcomeEmail(model.UserName, "http://www.gliist.com", model.UserName, "http://www.gliist.com", company.name);
            return Ok();
        }

        // GET api/Account/CompanyInfo
        [Route("DeleteRegisterByInvite")]
        [AllowAnonymous]
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteRegisterByInvite(string userName)
        {
            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

            if (!user.permissions.Contains("admin"))
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var userToDelete = _db.Users.SingleOrDefault(u => u.UserName == userName);
            userToDelete.company.users.Remove(userToDelete);

            var usersGuestLists = _db.GuestLists.Where(x => x.created_by.Id == userToDelete.Id).ToList();

            foreach (var usersGuestList in usersGuestLists)
            {
                usersGuestList.created_by = null;
            }

            if (userToDelete.permissions.Contains("promoter"))
            {
                var promoterGuestLists = _db.GuestLists.Where(x => x.promoter_Id == userToDelete.Id).ToList();

                foreach (var promoterGuestList in promoterGuestLists)
                {
                    promoterGuestList.promoter_Id = null;
                }
            }

            _db.Users.Remove(userToDelete);
            _db.Entry(userToDelete).State = EntityState.Deleted;
            await _db.SaveChangesAsync();


            return Ok();
        }

        // PUT api/Account/UserInfo
        [CheckAccess(DeniedPermissions = "promoter")]
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("UserInfo")]
        public async Task<IHttpActionResult> PutUserInfo(UserModel userModel)
        {
            if (userModel == null || !ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

            if (user == null)
            {
                return null;
            }

            user.firstName = userModel.firstName;
            user.lastName = userModel.lastName;
            user.phoneNumber = userModel.phoneNumber;
            user.city = userModel.city;
            user.company = userModel.company;
            user.bio = userModel.bio;

            _db.Entry(user).State = EntityState.Modified;

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        static byte[] _userProfile;

        [Route("ProfilePicture")]
        [AllowAnonymous]
        public async Task<HttpResponseMessage> GetProfilePicture(string userId)
        {
            var user = await UserManager.FindByIdAsync(userId);
            Stream imgStream;
            string fileName;
            if (string.IsNullOrEmpty(user.profilePicture))
            {
                //var path = HttpContext.Current.Server.MapPath("~/images/blank_user_icon.png");
                var path = HostingEnvironment.MapPath("~/images/blank_user_icon.png");
                fileName = "blank_user_icon.png";

                if (_userProfile == null)
                {
                    _userProfile = File.ReadAllBytes(path);
                }

                imgStream = new MemoryStream(_userProfile);
            }
            else
            {
                imgStream = new MemoryStream(user.profilePictureData);
                fileName = user.profilePicture;

            }
            var resp = new HttpResponseMessage()
            {
                Content = new StreamContent(imgStream)
            };

            // Find the MIME type
            string mimeType = FileUploadHelper.GetMimeType(Path.GetExtension(fileName));
            resp.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);

            return resp;
        }

        private async Task<string> uploadToBlob(UserModel user, string fileName, byte[] data)
        {
            var container = BlobHelper.GetWebApiContainer("profiles");
            var blob = container.GetBlockBlobReference(user.company.name.ToString() + "_" + DateTime.Now.Millisecond + "_" + fileName);
            blob.UploadFromByteArray(data, 0, data.Length);
            var userId = User.Identity.GetUserId();


            user.profilePictureUrl = blob.Uri.AbsoluteUri;

            return blob.Uri.AbsoluteUri;
        }

        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("ProfilePicture")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> PostProfilePicture()
        {
            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

            var profilePicImage = await FileUploadHelper.FilesToBytes(this.Request);

            await uploadToBlob(user, profilePicImage.Item1, profilePicImage.Item2);

            user.profilePictureData = profilePicImage.Item2;
            user.profilePicture = profilePicImage.Item1;

            _db.Entry(user).State = EntityState.Modified;

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(user.profilePicture);
        }

        // POST api/Account/Logout
        [Route("Logout")]
        public IHttpActionResult Logout()
        {
            Authentication.SignOut(CookieAuthenticationDefaults.AuthenticationType);
            return Ok();
        }

        // GET api/Account/ManageInfo?returnUrl=%2F&generateState=true
        [Route("ManageInfo")]
        public async Task<ManageInfoViewModel> GetManageInfo(string returnUrl, bool generateState = false)
        {
            UserModel user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

            if (user == null)
            {
                return null;
            }

            List<UserLoginInfoViewModel> logins = new List<UserLoginInfoViewModel>();

            foreach (IdentityUserLogin linkedAccount in user.Logins)
            {
                logins.Add(new UserLoginInfoViewModel
                {
                    LoginProvider = linkedAccount.LoginProvider,
                    ProviderKey = linkedAccount.ProviderKey
                });
            }

            if (user.PasswordHash != null)
            {
                logins.Add(new UserLoginInfoViewModel
                {
                    LoginProvider = LocalLoginProvider,
                    ProviderKey = user.UserName,
                });
            }

            return new ManageInfoViewModel
            {
                LocalLoginProvider = LocalLoginProvider,
                UserName = user.UserName,
                Logins = logins,
                ExternalLoginProviders = GetExternalLogins(returnUrl, generateState)
            };
        }

        // POST api/Account/ChangePassword
        [Route("ChangePassword")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> ChangePassword(ChangePasswordBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityResult result = await UserManager.ChangePasswordAsync(User.Identity.GetUserId(), model.OldPassword,
                model.NewPassword);
            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        // POST api/Account/SetPassword
        [Route("ResetPassword")]
        [AllowAnonymous]
        public async Task<IHttpActionResult> PostResetPassword(SetPasswordBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var token = _db.PasswordTokens.FirstOrDefault(t => string.Equals(t.token, model.token));

            if (token == null)
            {
                throw new ArgumentException("Please ask for reset new rest email");
            }

            _db.Entry(token).State = EntityState.Deleted;

            if ((token.created_at - DateTimeOffset.Now).Hours > 24)
            {
                throw new ArgumentException("Reset password token expired");
            }
            var userId = UserManager.FindByName(token.user_email).Id;

            IdentityResult result = UserManager.RemovePassword(userId);
            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            String hashedNewPassword = UserManager.PasswordHasher.HashPassword(model.NewPassword);
            result = UserManager.AddPassword(userId, hashedNewPassword);

            result = UserManager.RemovePassword(userId);
            result = UserManager.AddPassword(userId, model.NewPassword);
            errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        // POST api/Account/AddExternalLogin
        [Route("AddExternalLogin")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> AddExternalLogin(AddExternalLoginBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);

            AuthenticationTicket ticket = AccessTokenFormat.Unprotect(model.ExternalAccessToken);

            if (ticket == null || ticket.Identity == null || (ticket.Properties != null
                && ticket.Properties.ExpiresUtc.HasValue
                && ticket.Properties.ExpiresUtc.Value < DateTimeOffset.UtcNow))
            {
                return BadRequest("External login failure.");
            }

            ExternalLoginData externalData = ExternalLoginData.FromIdentity(ticket.Identity);

            if (externalData == null)
            {
                return BadRequest("The external login is already associated with an account.");
            }

            IdentityResult result = await UserManager.AddLoginAsync(User.Identity.GetUserId(),
                new UserLoginInfo(externalData.LoginProvider, externalData.ProviderKey));

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        // POST api/Account/RemoveLogin
        [Route("RemoveLogin")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> RemoveLogin(RemoveLoginBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityResult result;

            if (model.LoginProvider == LocalLoginProvider)
            {
                result = await UserManager.RemovePasswordAsync(User.Identity.GetUserId());
            }
            else
            {
                result = await UserManager.RemoveLoginAsync(User.Identity.GetUserId(),
                    new UserLoginInfo(model.LoginProvider, model.ProviderKey));
            }

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        // GET api/Account/ExternalLogin
        [OverrideAuthentication]
        [HostAuthentication(DefaultAuthenticationTypes.ExternalCookie)]
        [AllowAnonymous]
        [Route("ExternalLogin", Name = "ExternalLogin")]
        public async Task<IHttpActionResult> GetExternalLogin(string provider, string error = null)
        {
            if (error != null)
            {
                return Redirect(Url.Content("~/") + "#error=" + Uri.EscapeDataString(error));
            }

            if (!User.Identity.IsAuthenticated)
            {
                return new ChallengeResult(provider, this);
            }

            ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

            if (externalLogin == null)
            {
                return InternalServerError();
            }

            if (externalLogin.LoginProvider != provider)
            {
                Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
                return new ChallengeResult(provider, this);
            }

            UserModel user = await UserManager.FindAsync(new UserLoginInfo(externalLogin.LoginProvider,
                externalLogin.ProviderKey));

            bool hasRegistered = user != null;

            if (hasRegistered)
            {
                Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
                ClaimsIdentity oAuthIdentity = await UserManager.CreateIdentityAsync(user,
                    OAuthDefaults.AuthenticationType);
                ClaimsIdentity cookieIdentity = await UserManager.CreateIdentityAsync(user,
                    CookieAuthenticationDefaults.AuthenticationType);
                AuthenticationProperties properties = ApplicationOAuthProvider.CreateProperties(user.UserName);
                Authentication.SignIn(properties, oAuthIdentity, cookieIdentity);
            }
            else
            {
                IEnumerable<Claim> claims = externalLogin.GetClaims();
                ClaimsIdentity identity = new ClaimsIdentity(claims, OAuthDefaults.AuthenticationType);
                Authentication.SignIn(identity);
            }

            return Ok();
        }

        // GET api/Account/ExternalLogins?returnUrl=%2F&generateState=true
        [AllowAnonymous]
        [Route("ExternalLogins")]
        public IEnumerable<ExternalLoginViewModel> GetExternalLogins(string returnUrl, bool generateState = false)
        {
            IEnumerable<AuthenticationDescription> descriptions = Authentication.GetExternalAuthenticationTypes();
            List<ExternalLoginViewModel> logins = new List<ExternalLoginViewModel>();

            string state;

            if (generateState)
            {
                const int strengthInBits = 256;
                state = RandomOAuthStateGenerator.Generate(strengthInBits);
            }
            else
            {
                state = null;
            }

            foreach (AuthenticationDescription description in descriptions)
            {
                ExternalLoginViewModel login = new ExternalLoginViewModel
                {
                    Name = description.Caption,
                    Url = Url.Route("ExternalLogin", new
                    {
                        provider = description.AuthenticationType,
                        response_type = "token",
                        client_id = Startup.PublicClientId,
                        redirect_uri = new Uri(Request.RequestUri, returnUrl).AbsoluteUri,
                        state = state
                    }),
                    State = state
                };
                logins.Add(login);
            }

            return logins;
        }

        // POST api/Account/Register
        [AllowAnonymous]
        [Route("Register")]
        public async Task<IHttpActionResult> Register(RegisterBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var compnay = new Company()
             {
                 name = model.company
             };

            _db.Companies.Add(compnay);

            UserModel user = new UserModel
            {
                UserName = model.UserName,
                firstName = model.firstName,
                lastName = model.lastName,
                company = compnay,
                permissions = "admin"
            };

            compnay.users.Add(user);

            IdentityResult result = await UserManager.CreateAsync(user, model.Password);
            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            EmailHelper.SendWelcomeEmail(model.UserName, "http://www.gliist.com", model.UserName, "http://www.gliist.com", compnay.name);
            return Ok();
        }

        // POST api/Account/RegisterExternal
        [OverrideAuthentication]
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("RegisterExternal")]
        [CheckAccess(DeniedPermissions = "promoter")]
        public async Task<IHttpActionResult> RegisterExternal(RegisterExternalBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

            if (externalLogin == null)
            {
                return InternalServerError();
            }

            UserModel user = new UserModel
            {
                UserName = model.UserName
            };
            user.Logins.Add(new IdentityUserLogin
            {
                LoginProvider = externalLogin.LoginProvider,
                ProviderKey = externalLogin.ProviderKey
            });
            IdentityResult result = await UserManager.CreateAsync(user);
            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                UserManager.Dispose();
            }

            base.Dispose(disposing);
        }

        #region Helpers

        private IAuthenticationManager Authentication
        {
            get { return Request.GetOwinContext().Authentication; }
        }

        private IHttpActionResult GetErrorResult(IdentityResult result)
        {
            if (result == null)
            {
                return InternalServerError();
            }

            if (!result.Succeeded)
            {
                if (result.Errors != null)
                {
                    foreach (string error in result.Errors)
                    {
                        ModelState.AddModelError("", error);
                    }
                }

                if (ModelState.IsValid)
                {
                    // No ModelState errors are available to send, so just return an empty BadRequest.
                    return BadRequest();
                }

                return BadRequest(ModelState);
            }

            return null;
        }

        private class ExternalLoginData
        {
            public string LoginProvider { get; set; }
            public string ProviderKey { get; set; }
            public string UserName { get; set; }

            public IList<Claim> GetClaims()
            {
                IList<Claim> claims = new List<Claim>();
                claims.Add(new Claim(ClaimTypes.NameIdentifier, ProviderKey, null, LoginProvider));

                if (UserName != null)
                {
                    claims.Add(new Claim(ClaimTypes.Name, UserName, null, LoginProvider));
                }

                return claims;
            }

            public static ExternalLoginData FromIdentity(ClaimsIdentity identity)
            {
                if (identity == null)
                {
                    return null;
                }

                Claim providerKeyClaim = identity.FindFirst(ClaimTypes.NameIdentifier);

                if (providerKeyClaim == null || String.IsNullOrEmpty(providerKeyClaim.Issuer)
                    || String.IsNullOrEmpty(providerKeyClaim.Value))
                {
                    return null;
                }

                if (providerKeyClaim.Issuer == ClaimsIdentity.DefaultIssuer)
                {
                    return null;
                }

                return new ExternalLoginData
                {
                    LoginProvider = providerKeyClaim.Issuer,
                    ProviderKey = providerKeyClaim.Value,
                    UserName = identity.FindFirstValue(ClaimTypes.Name)
                };
            }
        }

        private static class RandomOAuthStateGenerator
        {
            private static RandomNumberGenerator _random = new RNGCryptoServiceProvider();

            public static string Generate(int strengthInBits)
            {
                const int bitsPerByte = 8;

                if (strengthInBits % bitsPerByte != 0)
                {
                    throw new ArgumentException("strengthInBits must be evenly divisible by 8.", "strengthInBits");
                }

                int strengthInBytes = strengthInBits / bitsPerByte;

                byte[] data = new byte[strengthInBytes];
                _random.GetBytes(data);
                return HttpServerUtility.UrlTokenEncode(data);
            }
        }

        #endregion
    }
}
