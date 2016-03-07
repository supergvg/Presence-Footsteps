using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace gliist_server.Tests.Shared
{
    public static class ControllerHelper
    {
        public static IHttpActionResult ExecuteAction<T>(this ApiController controller, Func<T, IHttpActionResult> action, T model)
        {
            if (model != null)
                BindModel(controller, model);

            return action(model);
        }

        public static async Task<IHttpActionResult> ExecuteActionAsync<T>(this ApiController controller, Func<T, Task<IHttpActionResult>> action, T model)
        {
            if (model != null)
                BindModel(controller, model);

            return await action(model);
        }

        private static void BindModel(ApiController controller, object model)
        {
            var validationContext = new ValidationContext(model, null, null);
            var validationResults = new List<ValidationResult>();
            Validator.TryValidateObject(model, validationContext, validationResults, true);
            foreach (var validationResult in validationResults)
            {
                controller.ModelState.AddModelError(validationResult.MemberNames.First(), validationResult.ErrorMessage);
            }
        }
    }
}
