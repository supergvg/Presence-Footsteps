using System.Linq;
using System.Threading.Tasks;
using System.Web.Http.Results;
using gliist_server.Controllers;
using gliist_server.Models;
using gliist_server.Tests.Shared;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace gliist_server.Tests.Account
{
    [TestClass]
    public class RegisterInviteCodeValidationTests
    {
        [TestMethod]
        public async Task BadRequest_IfIsEmpty()
        {
            var controller = new AccountController();

            var result = await controller.ExecuteActionAsync(controller.Register, new ExternalRegisterBindingModel
            {

                UserName = "username@email.com",
                Password = "password1",
                ConfirmPassword = "password1",
                firstName = "firstName",
                lastName = "lastName",
                company = "company"
            });

        
            var actual = result as InvalidModelStateResult;
            Assert.IsNotNull(actual);

            var error = actual.ModelState["inviteCode"];
            Assert.IsNotNull(error);
            Assert.AreEqual("Invite code is required.", error.Errors[0].ErrorMessage);
        }

        [TestMethod]
        public async Task BadRequest_IfIsNotCorrect()
        {
            var controller = new AccountController();

            var result = await controller.ExecuteActionAsync(controller.Register, new ExternalRegisterBindingModel
            {

                UserName = "username@email.com",
                Password = "password1",
                ConfirmPassword = "password1",
                firstName = "firstName",
                lastName = "lastName",
                company = "company",
                inviteCode = "inviteCode"
            });


            var actual = result as BadRequestErrorMessageResult;

            Assert.IsNotNull(actual);
            Assert.AreEqual("Invite code is invalid.", actual.Message);
        }
    }
}
