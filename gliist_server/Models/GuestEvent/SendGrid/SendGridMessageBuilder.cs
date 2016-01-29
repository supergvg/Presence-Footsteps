using System.Collections.Generic;
using System.Net.Mail;
using SendGrid;

namespace gliist_server.Models
{
    class SendGridMessageBuilder
    {
        public ISendGrid Result { get; private set; }

        public SendGridMessageBuilder(SendGridHeader header)
        {
            CreateMessage(header);
        }

        public void ApplyTemplate(string templateId)
        {
            Result.EnableTemplateEngine(templateId);
        }

        public void SetCategories(IEnumerable<string> categories)
        {
            Result.SetCategories(categories);
        }

        public void ApplySubstitutions(IDictionary<string, string> substitutions)
        {
            foreach (var key in substitutions.Keys)
            {
                Result.AddSubstitution(key, new List<string> {substitutions[key] ?? string.Empty});
            }
        }

        private void CreateMessage(SendGridHeader header)
        {
            Result = new SendGridMessage {Html = "<p></p>"};
            Result.EnableOpenTracking();
            Result.EnableClickTracking();

            AddHeader(header);
        }

        private void AddHeader(SendGridHeader header)
        {
            Result.AddTo(header.To);
            Result.From = new MailAddress("non-reply@gjests.com", header.From);
            Result.Subject = header.Subject;
        }
    }
}